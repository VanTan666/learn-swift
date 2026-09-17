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

Ниже — полный рабочий вариант. Внешний и внутренний радиусы определяют период кривой, `distance` сдвигает рисующую точку, а `amount` позволяет показать только часть пути.

```swift
struct Spirograph: Shape {
    var outerRadius: Double
    var innerRadius: Double
    var distance: Double
    var amount: Double

    var animatableData: AnimatablePair<
        AnimatablePair<Double, Double>,
        AnimatablePair<Double, Double>
    > {
        get {
            AnimatablePair(
                AnimatablePair(outerRadius, innerRadius),
                AnimatablePair(distance, amount)
            )
        }
        set {
            outerRadius = newValue.first.first
            innerRadius = newValue.first.second
            distance = newValue.second.first
            amount = newValue.second.second
        }
    }

    func path(in rect: CGRect) -> Path {
        let divisor = greatestCommonDivisor(Int(outerRadius), Int(innerRadius))
        let difference = outerRadius - innerRadius
        let period = 2 * Double.pi * innerRadius / Double(divisor)
        let endPoint = period * amount

        var path = Path()

        for theta in stride(from: 0.0, through: endPoint, by: 0.01) {
            let x = difference * cos(theta)
                + distance * cos(difference / innerRadius * theta)
            let y = difference * sin(theta)
                - distance * sin(difference / innerRadius * theta)
            let point = CGPoint(x: x + rect.midX, y: y + rect.midY)

            if theta == 0 {
                path.move(to: point)
            } else {
                path.addLine(to: point)
            }
        }

        return path
    }

    private func greatestCommonDivisor(_ first: Int, _ second: Int) -> Int {
        var a = first
        var b = second

        while b != 0 {
            let remainder = a % b
            a = b
            b = remainder
        }

        return a
    }
}

struct SpirographDemo: View {
    @State private var outerRadius = 125.0
    @State private var innerRadius = 75.0
    @State private var distance = 100.0
    @State private var amount = 1.0

    var body: some View {
        VStack {
            Spirograph(
                outerRadius: outerRadius,
                innerRadius: innerRadius,
                distance: distance,
                amount: amount
            )
            .stroke(
                AngularGradient(colors: [.orange, .pink, .indigo, .orange], center: .center),
                lineWidth: 2
            )
            .frame(width: 300, height: 300)
            .animation(.easeInOut, value: outerRadius)
            .animation(.easeInOut, value: innerRadius)
            .animation(.easeInOut, value: distance)
            .animation(.easeInOut, value: amount)

            LabeledContent("Внешний радиус") {
                Slider(value: $outerRadius, in: 80...150)
            }
            LabeledContent("Внутренний радиус") {
                Slider(value: $innerRadius, in: 20...75)
            }
            LabeledContent("Расстояние") {
                Slider(value: $distance, in: 10...120)
            }
            LabeledContent("Часть рисунка") {
                Slider(value: $amount, in: 0...1)
            }
        }
        .padding()
    }
}
```

`animatableData` перечисляет четыре изменяемых числа, поэтому SwiftUI может интерполировать их между старым и новым состоянием. Ограничения sliders не дают внутреннему радиусу стать нулём.

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
<template #task>Измени готовый spirograph: добавь slider толщины линии и вторую цветовую палитру, которую можно переключать кнопкой.</template>
<template #knowledge>Loops, Double, trigonometry, Shape protocol, state и animation.</template>
<template #hint1>Толщина линии — обычный `@State Double`, который передаётся в `stroke`.</template>
<template #hint2>Палитру можно вычислять из `@State Bool`, не создавая второй `Spirograph`.</template>
<template #solution>

```swift
@State private var lineWidth = 2.0
@State private var usesCoolPalette = false

var colors: [Color] {
    usesCoolPalette ? [.cyan, .blue, .purple, .cyan] : [.orange, .pink, .indigo, .orange]
}

// В body:
// .stroke(AngularGradient(colors: colors, center: .center), lineWidth: lineWidth)
```

</template>
</Challenge>

<ProjectRecap slug="project-09-drawing" />

Проверь навыки группы в [Milestone Projects 7–9 →](/projects/milestone-07-09).
