---
title: Project 9 — Drawing
description: Path, Shape, strokes, transforms и Canvas.
projectSlug: project-09-drawing
---

# Project 9 — Drawing

В Drawing мы создаём графику кодом: от простого треугольника до анимируемого spirograph. Здесь особенно хорошо видно, как protocol превращает математический алгоритм в reusable SwiftUI View.

<ProjectPrerequisites slug="project-09-drawing" />

## Рабочий vertical slice

```swift
import SwiftUI

struct Triangle: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: rect.midX, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
        path.addLine(to: CGPoint(x: rect.minX, y: rect.maxY))
        path.closeSubpath()
        return path
    }
}

struct ContentView: View {
    @State private var inset = 20.0

    var body: some View {
        VStack {
            Triangle()
                .fill(.orange.gradient)
                .overlay { Triangle().stroke(.indigo, lineWidth: 8) }
                .padding(inset)
                .animation(.easeInOut, value: inset)

            Slider(value: $inset, in: 0...80) { Text("Отступ") }
        }
        .padding()
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Оранжевый треугольник")
    }
}

#Preview { ContentView() }
```

Здесь есть complete path → shape → fill/stroke → state. Canvas и spirograph идут после этой рабочей основы.

## Path для разового рисунка

```swift
Path { path in
    path.move(to: CGPoint(x: 200, y: 100))
    path.addLine(to: CGPoint(x: 100, y: 300))
    path.addLine(to: CGPoint(x: 300, y: 300))
    path.closeSubpath()
}
.stroke(.blue, lineWidth: 10)
```

Closure получает изменяемый `Path` и добавляет команды рисования.

## Shape для reusable геометрии

```swift
struct Triangle: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: rect.midX, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.minX, y: rect.maxY))
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
        path.closeSubpath()
        return path
    }
}
```

`Shape` — protocol. Struct обязуется реализовать `path(in:)`, после чего получает modifiers `fill`, `stroke` и другие возможности.

## Insets и borders

Обычный `stroke` рисует половину линии за пределами path. Для точного внутреннего border реализуй `InsettableShape` и храни `insetAmount`.

## Анимация формы

SwiftUI умеет интерполировать properties, перечисленные через `animatableData`. Для двух значений используй `AnimatablePair`.

## Spirograph

Алгоритм проходит Range с маленьким шагом, вычисляет точки через `sin`/`cos` и соединяет их. Циклы из Day 6 теперь непосредственно строят изображение.

## Canvas для большого числа элементов

`Canvas` подходит, когда нужно нарисовать много примитивов без отдельного дерева View для каждого из них. Closure получает `GraphicsContext` и доступный размер.

```swift
Canvas { context, size in
    let rect = CGRect(origin: .zero, size: size).insetBy(dx: 12, dy: 12)
    let circle = Path(ellipseIn: rect)

    context.fill(circle, with: .linearGradient(
        Gradient(colors: [.indigo, .cyan]),
        startPoint: rect.origin,
        endPoint: CGPoint(x: rect.maxX, y: rect.maxY)
    ))
}
.frame(height: 240)
.accessibilityLabel("Сине-фиолетовый круг")
```

Canvas сам по себе не создаёт доступные элементы для каждой фигуры. Если графика передаёт данные, добавьте понятное описание или отдельное доступное представление.

<Challenge>
<template #task>Создай цветной spirograph со sliders для параметров и плавной animation при их изменении.</template>
<template #knowledge>Loops, Double, trigonometry, Shape protocol, state и animation.</template>
<template #hint1>Нормализуй делитель greatest common divisor, чтобы вычислить полный цикл.</template>
<template #hint2>Передай одно или несколько чисел через `animatableData`.</template>
<template #solution>

```swift
var animatableData: AnimatablePair<Double, Double> {
    get { AnimatablePair(innerRadius, distance) }
    set { innerRadius = newValue.first; distance = newValue.second }
}
```

</template>
</Challenge>

<ProjectRecap slug="project-09-drawing" />

Проверь навыки группы в [Milestone Projects 7–9 →](/projects/milestone-07-09).
