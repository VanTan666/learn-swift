---
title: Project 9 — Drawing
description: Path, Shape, strokes, transforms и Canvas.
projectSlug: project-09-drawing
---

# Project 9 — Drawing

В Drawing мы создаём графику кодом: от простого треугольника до анимируемого spirograph. Здесь особенно хорошо видно, как protocol превращает математический алгоритм в reusable SwiftUI View.

<ProjectPrerequisites slug="project-09-drawing" />

## Стартовая точка

Создай новый **iOS → App** с именем **Drawing** и интерфейсом SwiftUI. В сгенерированном `ContentView.swift` оставь минимальное состояние ниже. Сохрани файл `DrawingApp.swift`, созданный Xcode; если шаг меняет точку входа, замени существующий файл, не создавай второй `@main`.

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        Text("Начало")
    }
}
```

Сначала прочитай задание шага и попробуй выполнить его. Решение закрыто: открой его для сверки или если застрял. Применяй изменения по порядку — каждый шаг опирается на предыдущий.

### Шаг 1. Первый Path

**Цель:** Первый Path.

**Попробуй сам:** Нарисуй треугольник тремя линиями внутри области 300 × 300, замкни путь и обведи его.

<details>
<summary>Показать решение шага 1</summary>

В **ContentView.swift** найди этот блок:

```swift
Text("Начало")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
Path { path in
            path.move(to: CGPoint(x: 150, y: 0))
            path.addLine(to: CGPoint(x: 300, y: 300))
            path.addLine(to: CGPoint(x: 0, y: 300))
            path.closeSubpath()
        }
        .stroke(.blue, lineWidth: 4)
        .frame(width: 300, height: 300)
```


</details>

**Ожидаемый результат:** Виден синий замкнутый треугольник. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Path хранит команды рисования. move задаёт первую точку, addLine добавляет отрезок, closeSubpath соединяет последнюю точку с первой.

Начало координат находится в левом верхнем углу области: x растёт вправо, y — вниз. Поэтому вершина в (150, 0), а нижние углы имеют y = 300. `move(to:)` переносит перо без линии. Попробуй убрать closeSubpath: исчезнет последняя сторона обводки.

### Шаг 2. Shape и доступный размер

**Цель:** Shape и доступный размер.

**Попробуй сам:** Вынеси геометрию в Triangle: Shape. Используй rect вместо фиксированных координат.

<details>
<summary>Показать решение шага 2</summary>

**Triangle.swift** — создай файл и включи его в target приложения.

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
```

В **ContentView.swift** найди этот блок:

```swift
Path { path in
            path.move(to: CGPoint(x: 150, y: 0))
            path.addLine(to: CGPoint(x: 300, y: 300))
            path.addLine(to: CGPoint(x: 0, y: 300))
            path.closeSubpath()
        }
        .stroke(.blue, lineWidth: 4)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
Triangle()
        .fill(.orange.gradient)
        .overlay { Triangle().stroke(.indigo, lineWidth: 4) }
```


</details>

**Ожидаемый результат:** Треугольник подстраивается под frame и сохраняет пропорции относительно границ. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Shape реализует path(in:). Родитель сообщает rect, поэтому одна структура пригодна для разных размеров; знакомый protocol задаёт контракт.

`rect.midX` — середина по горизонтали, `minY` — верхняя граница, `maxY` — нижняя. Фигура теперь определяется относительно переданного прямоугольника. Для проверки временно измени frame с 300 × 300 на 200 × 120: Shape должен заполнить новую область, а не продолжить рисовать по старым абсолютным координатам.

### Шаг 3. Управление отступом

**Цель:** Управление отступом.

**Попробуй сам:** Оберни рисунок в VStack, добавь Slider отступа 0…60 и привяжи padding к нему.

<details>
<summary>Показать решение шага 3</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var inset = 20.0
```

В **ContentView.swift** найди этот блок:

```swift
Triangle()
        .fill(.orange.gradient)
        .overlay { Triangle().stroke(.indigo, lineWidth: 4) }
        .frame(width: 300, height: 300)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
VStack {
            Triangle()
                .fill(.orange.gradient)
                .overlay { Triangle().stroke(.indigo, lineWidth: 4) }
                .padding(inset)
                .frame(width: 300, height: 300)
            Slider(value: $inset, in: 0...60) { Text("Отступ") }
        }
        .padding()
```


</details>

**Ожидаемый результат:** Ползунок уменьшает доступную область треугольника, линия остаётся видимой. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Fill закрашивает область, stroke рисует границу. Padding меняет предложенный Shape размер. Это ещё не анимация самой математической кривой.

Порядок padding и frame здесь важен: внешний frame ограничивает область 300 × 300, padding уменьшает доступное место для вложенной формы. Если переставить их, внешний размер композиции изменится. Ползунок хранит Double, а SwiftUI принимает это значение как величину отступа.

### Шаг 4. Построение Spirograph

**Цель:** Построение Spirograph.

**Попробуй сам:** Добавь Shape с outerRadius, innerRadius, distance и amount. Соединяй вычисленные sin/cos точки с шагом 0.01. Поставь готовую кривую вместо треугольника, сохрани ползунок отступа.

<details>
<summary>Показать решение шага 4</summary>

**Spirograph.swift** — создай файл и включи его в target приложения.

```swift
import SwiftUI

struct Spirograph: Shape {
    var outerRadius: Double
    var innerRadius: Double
    var distance: Double
    var amount: Double

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
```

В **ContentView.swift** найди этот блок:

```swift
Triangle()
                .fill(.orange.gradient)
                .overlay { Triangle().stroke(.indigo, lineWidth: 4) }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
Spirograph(outerRadius: 80, innerRadius: 30, distance: 50, amount: 1)
                .stroke(.indigo, lineWidth: 2)
```


</details>

**Ожидаемый результат:** Появилась замкнутая узорная кривая. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Разность радиусов задаёт положение внутренней окружности, distance — смещение пера. НОД целых радиусов определяет период. Пока используем положительные целые радиусы и статичные параметры, чтобы сначала проверить геометрию.

Не нужно выводить формулу заново. Обозначим разность радиусов как d, внутренний радиус как r, расстояние пера как h, угол как t. Координаты: x = d·cos(t) + h·cos(d/r·t), y = d·sin(t) − h·sin(d/r·t). После вычисления прибавляем центр rect. НОД радиусов определяет, когда рисунок замкнётся; цикл проходит этот период маленькими отрезками. Здесь сложность математическая, а Swift-механика — знакомые цикл, функция и структура.

### Шаг 5. Параметры кривой

**Цель:** Параметры кривой.

**Попробуй сам:** Добавь ползунки innerRadius, distance и amount. Для радиуса используй step 1 и диапазон 20…60.

<details>
<summary>Показать решение шага 5</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var innerRadius = 30.0
    @State private var distance = 50.0
    @State private var amount = 1.0
```

В **ContentView.swift** найди этот блок:

```swift
Spirograph(outerRadius: 80, innerRadius: 30, distance: 50, amount: 1)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
Spirograph(outerRadius: 80, innerRadius: innerRadius, distance: distance, amount: amount)
```

В **ContentView.swift** найди этот блок:

```swift
Slider(value: $inset, in: 0...60) { Text("Отступ") }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
Slider(value: $inset, in: 0...60) { Text("Отступ") }
            LabeledContent("Радиус") { Slider(value: $innerRadius, in: 20...60, step: 1) }
            LabeledContent("Расстояние") { Slider(value: $distance, in: 10...60) }
            LabeledContent("Часть пути") { Slider(value: $amount, in: 0...1) }
```


</details>

**Ожидаемый результат:** Часть рисунка 0 скрывает кривую, 1 рисует полный период. Изменение расстояния меняет узор. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Параметры Shape — обычные значения, вычисление Path повторяется после изменения @State. Целый шаг радиуса соответствует алгоритму НОД и не допускает нулевой делитель.

`amount` задаёт долю полного периода, а не толщину или прозрачность. При 0.5 цикл проходит половину пути. Целый шаг внутреннего радиуса согласован с вычислением НОД, которое использует Int. Проверь отдельно каждый ползунок: так видна связь одного параметра с геометрией.

### Шаг 6. Анимация рисования

**Цель:** Анимация рисования.

**Попробуй сам:** Сделай amount animatableData и добавь кнопку переключения между 0 и 1 с линейной анимацией.

<details>
<summary>Показать решение шага 6</summary>

В **Spirograph.swift** добавь код перед строкой `func path(in rect: CGRect) -> Path {`:

```swift
    var animatableData: Double {
        get { amount }
        set { amount = newValue }
    }
```

В **ContentView.swift** найди этот блок:

```swift
LabeledContent("Часть пути") { Slider(value: $amount, in: 0...1) }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
LabeledContent("Часть пути") { Slider(value: $amount, in: 0...1) }
            Button("Нарисовать / стереть") {
                withAnimation(.linear(duration: 2)) { amount = amount == 0 ? 1 : 0 }
            }
```


</details>

**Ожидаемый результат:** Кнопка постепенно рисует или стирает кривую, а ползунки сохраняют управление. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** SwiftUI интерполирует animatableData между состояниями. Здесь достаточно одного Double: сложный AnimatablePair не нужен, пока мы анимируем только долю пути.

Getter animatableData сообщает текущее amount, setter принимает промежуточные значения, которые вычисляет SwiftUI во время перехода. Path строится для каждого такого значения. Внутренний радиус при этом не анимируется: мы намеренно выбрали одну понятную величину, чтобы рисунок постепенно появлялся, а не менял сразу всю геометрию.

## Глубже — необязательно

::: details Глубже: Canvas и внутренние границы
Canvas рисует множество примитивов в одном GraphicsContext; для отдельных доступных элементов чаще удобнее Shape. Самостоятельно замени Spirograph следующим кругом:

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

`stroke` расположен по обе стороны линии. Для внутренней границы изучи InsettableShape и strokeBorder. Сложную анимацию нескольких параметров через AnimatablePair можно добавить после основной сборки.
:::

## Самостоятельное изменение

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

## Reference: полный код проекта

Основной маршрут, без самостоятельного challenge. Используй этот блок для сверки уже собранного приложения.

<details>
<summary>Открыть все итоговые файлы проекта</summary>

### ContentView.swift

```swift
import SwiftUI

struct ContentView: View {
    @State private var inset = 20.0

    @State private var innerRadius = 30.0
    @State private var distance = 50.0
    @State private var amount = 1.0

    var body: some View {
        VStack {
            Spirograph(outerRadius: 80, innerRadius: innerRadius, distance: distance, amount: amount)
                .stroke(.indigo, lineWidth: 2)
                .padding(inset)
                .frame(width: 300, height: 300)
            Slider(value: $inset, in: 0...60) { Text("Отступ") }
            LabeledContent("Радиус") { Slider(value: $innerRadius, in: 20...60, step: 1) }
            LabeledContent("Расстояние") { Slider(value: $distance, in: 10...60) }
            LabeledContent("Часть пути") { Slider(value: $amount, in: 0...1) }
            Button("Нарисовать / стереть") {
                withAnimation(.linear(duration: 2)) { amount = amount == 0 ? 1 : 0 }
            }
        }
        .padding()
    }
}
```

### DrawingApp.swift

```swift
import SwiftUI

@main
struct DrawingApp: App {
    var body: some Scene {
        WindowGroup { ContentView() }
    }
}
```

### Triangle.swift

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
```

### Spirograph.swift

```swift
import SwiftUI

struct Spirograph: Shape {
    var outerRadius: Double
    var innerRadius: Double
    var distance: Double
    var amount: Double

    var animatableData: Double {
        get { amount }
        set { amount = newValue }
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
```

</details>

<ProjectRecap slug="project-09-drawing" />

Проверь навыки группы в [Milestone Projects 7–9 →](/projects/milestone-07-09).
