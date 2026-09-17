---
title: Project 18 — Layout and Geometry
description: Layout cycle, GeometryReader, alignment и custom Layout.
projectSlug: project-18-layout
---

# Project 18 — Layout and Geometry

SwiftUI layout работает как разговор: родитель предлагает размер, ребёнок выбирает свой, родитель размещает результат. Понимание этого цикла объясняет многие «странные» эффекты `frame`, `position` и `GeometryReader`.

<ProjectPrerequisites slug="project-18-layout" />

## Рабочий vertical slice

```swift
import SwiftUI

struct EqualWidthHStack: Layout {
    func sizeThatFits(
        proposal: ProposedViewSize,
        subviews: Subviews,
        cache: inout ()
    ) -> CGSize {
        guard !subviews.isEmpty else { return .zero }
        let width = proposal.width ?? 300
        let itemWidth = width / CGFloat(subviews.count)
        let height = subviews.map {
            $0.sizeThatFits(.init(width: itemWidth, height: proposal.height)).height
        }.max() ?? 0
        return CGSize(width: width, height: height)
    }

    func placeSubviews(
        in bounds: CGRect,
        proposal: ProposedViewSize,
        subviews: Subviews,
        cache: inout ()
    ) {
        guard !subviews.isEmpty else { return }
        let width = bounds.width / CGFloat(subviews.count)
        for (index, subview) in subviews.enumerated() {
            subview.place(
                at: CGPoint(x: bounds.minX + CGFloat(index) * width, y: bounds.minY),
                anchor: .topLeading,
                proposal: .init(width: width, height: bounds.height)
            )
        }
    }
}

struct ContentView: View {
    var body: some View {
        EqualWidthHStack {
            ForEach(["Swift", "SwiftUI", "Xcode"], id: \.self) { item in
                Text(item)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical)
                    .background(.indigo.opacity(0.15))
            }
        }
        .padding()
    }
}

#Preview { ContentView() }
```

Этот Layout полностью измеряет и размещает subviews, включая пустой набор. Измените ширину Preview и проверьте, что три элемента остаются равными.

## Предложение, ответ, размещение

Modifier `frame(width:height:)` не меняет внутренний View напрямую — он создаёт новый container, который предлагает размер ребёнку и сообщает свой размер родителю.

```swift
Text("Hello")
    .background(.red)
    .frame(width: 200, height: 100)
    .background(.blue)
```

Два background наглядно показывают границы текста и внешнего frame.

## Alignment guides

Alignment guide позволяет View сообщить нестандартную точку выравнивания. Closure получает `ViewDimensions` и возвращает координату.

```swift
.alignmentGuide(.leading) { dimensions in
    dimensions[.leading] - 20
}
```

## GeometryReader

GeometryReader предоставляет размер и координаты container, но сам охотно занимает всё предложенное пространство. Используй его локально, когда layout действительно зависит от geometry, а не как универсальный spacer.

## Custom Layout

Protocol `Layout` требует measurement и placement. Это снова знакомый pattern: struct соответствует protocol и реализует functions.

```swift
struct RadialLayout: Layout {
    func sizeThatFits(
        proposal: ProposedViewSize,
        subviews: Subviews,
        cache: inout ()
    ) -> CGSize {
        proposal.replacingUnspecifiedDimensions(
            by: CGSize(width: 300, height: 300)
        )
    }

    func placeSubviews(
        in bounds: CGRect,
        proposal: ProposedViewSize,
        subviews: Subviews,
        cache: inout ()
    ) {
        guard !subviews.isEmpty else { return }

        let center = CGPoint(x: bounds.midX, y: bounds.midY)
        let radius = max(0, min(bounds.width, bounds.height) / 2 - 32)

        for (index, subview) in subviews.enumerated() {
            let angle = Double(index) / Double(subviews.count) * 2 * Double.pi
            let point = CGPoint(
                x: center.x + cos(angle) * radius,
                y: center.y + sin(angle) * radius
            )
            subview.place(at: point, anchor: .center, proposal: .unspecified)
        }
    }
}
```

::: details Глубже: готовые адаптивные инструменты
Для простого выбора из нескольких компоновок сначала попробуйте `ViewThatFits` или `AnyLayout`. `containerRelativeFrame` привязывает размер к контейнеру, а `onGeometryChange` считывает только нужное значение без широкого `GeometryReader`. Они не нужны для понимания первого custom `Layout`.
:::

## Scroll effects

Geometry каждого элемента может управлять hue, scale или rotation во время scroll. Эффект должен помогать ориентации, а не мешать чтению; учитывай Reduce Motion.

<Challenge>
<template #task>Создай radial layout для набора buttons и адаптируй его к доступному размеру. Добавь альтернативу без движения.</template>
<template #knowledge>Functions, closures, structs, protocols, geometry и trigonometry.</template>
<template #hint1>Угол шага равен `2 * .pi / Double(subviews.count)`.</template>
<template #hint2>Радиус возьми как половину меньшей стороны за вычетом размера элемента.</template>
<template #solution>

```swift
let angle = Angle.radians(Double(index) / Double(subviews.count) * 2 * .pi)
let point = CGPoint(x: center.x + cos(angle.radians) * radius,
                    y: center.y + sin(angle.radians) * radius)
subview.place(at: point, anchor: .center, proposal: .unspecified)
```

</template>
</Challenge>

<ProjectRecap slug="project-18-layout" />

Финальный большой проект объединит navigation и adaptive UI: [SnowSeeker →](/projects/project-19-snowseeker).
