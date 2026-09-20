---
title: Project 18 — Layout and Geometry
description: Layout cycle, GeometryReader, alignment и custom Layout.
projectSlug: project-18-layout
---

# Project 18 — Layout and Geometry

SwiftUI layout работает как разговор: родитель предлагает размер, ребёнок выбирает свой, родитель размещает результат. Понимание этого цикла объясняет многие «странные» эффекты `frame`, `position` и `GeometryReader`.

<ProjectPrerequisites slug="project-18-layout" />

## Стартовая точка

Создай новый **iOS → App** с именем **LayoutLab** и интерфейсом SwiftUI. В сгенерированном `ContentView.swift` оставь минимальное состояние ниже. Сохрани файл `LayoutLabApp.swift`, созданный Xcode; если шаг меняет точку входа, замени существующий файл, не создавай второй `@main`.

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        Text("Начало")
    }
}
```

Сначала прочитай задание шага и попробуй выполнить его. Решение закрыто: открой его для сверки или если застрял. Применяй изменения по порядку — каждый шаг опирается на предыдущий.

### Шаг 1. Границы View и frame

**Цель:** Границы View и frame.

**Попробуй сам:** Добавь красный фон к Text, затем frame 200 × 100, затем синий фон.

<details>
<summary>Показать решение шага 1</summary>

В **ContentView.swift** найди этот блок:

```swift
Text("Начало")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
Text("Hello")
            .background(.red)
            .frame(width: 200, height: 100)
            .background(.blue)
```


</details>

**Ожидаемый результат:** Красный фон ограничен текстом, синий — внешним прямоугольником. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Родитель предлагает размер, дочерний View отвечает своим размером. frame создаёт контейнер, а не растягивает нарисованные буквы. Порядок modifiers делает границы видимыми.

Красная область отвечает размеру текста, синяя — результату frame. Надпись не обязана растягивать буквы до 200 точек: она выбирает свой размер внутри предложения. Это базовый способ отладки layout — временно обозначать фоном границы разных уровней композиции.

### Шаг 2. Выравнивание

**Цель:** Выравнивание.

**Попробуй сам:** Помести два текста в VStack(alignment: .leading). Второму задай alignmentGuide со сдвигом относительно leading.

<details>
<summary>Показать решение шага 2</summary>

В **ContentView.swift** найди этот блок:

```swift
Text("Hello")
            .background(.red)
            .frame(width: 200, height: 100)
            .background(.blue)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
VStack(alignment: .leading, spacing: 20) {
            Text("Swift").background(.orange)
            Text("SwiftUI")
                .background(.cyan)
                .alignmentGuide(.leading) { dimensions in dimensions[.leading] - 20 }
        }
        .padding()
```


</details>

**Ожидаемый результат:** Вторая надпись смещена относительно общей линии выравнивания. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Guide возвращает координату внутри дочернего элемента, которую родитель совмещает с линией выравнивания. Это отличается от offset, который меняет только отображение после layout.

Guide сообщает точку, которую родитель должен совместить с leading других детей. Возвращая значение на 20 меньше обычного, мы сдвигаем видимое содержимое относительно общей линии. Сравни с `.offset(x: 20)`: похожая картинка не означает одинаковое участие в размещении.

### Шаг 3. Локальный GeometryReader

**Цель:** Локальный GeometryReader.

**Попробуй сам:** Добавь под надписями область высотой 80. Нарисуй в ней прямоугольник половины доступной ширины и выведи измеренную ширину.

<details>
<summary>Показать решение шага 3</summary>

В **ContentView.swift** найди этот блок:

```swift
        }
        .padding()
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
            GeometryReader { proxy in
                VStack(alignment: .leading) {
                    Rectangle().fill(.indigo).frame(width: proxy.size.width / 2, height: 30)
                    Text("Ширина: \(proxy.size.width.formatted())")
                }
            }
            .frame(height: 80)
        }
        .padding()
```


</details>

**Ожидаемый результат:** Изменение ширины окна меняет прямоугольник и число; высота области остаётся 80. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** GeometryReader охотно занимает предложенное пространство, поэтому ограничиваем его локально. Размер берём из proxy, не из глобальных границ экрана.

У GeometryReader размер относится к его собственной области, а не ко всему устройству. `.frame(height: 80)` ограничивает жадное расширение по вертикали. Для проверки меняй ширину окна: половина proxy.size.width должна оставаться половиной именно этой области.

### Шаг 4. Равные колонки стандартными средствами

**Цель:** Равные колонки стандартными средствами.

**Попробуй сам:** Добавь HStack из Swift, SwiftUI, Xcode. Каждому Text дай maxWidth infinity.

<details>
<summary>Показать решение шага 4</summary>

В **ContentView.swift** найди этот блок:

```swift
            GeometryReader { proxy in
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
            HStack(spacing: 0) {
                ForEach(["Swift", "SwiftUI", "Xcode"], id: \.self) { item in
                    Text(item).frame(maxWidth: .infinity).padding(.vertical)
                        .background(.indigo.opacity(0.15))
                }
            }
            GeometryReader { proxy in
```


</details>

**Ожидаемый результат:** Три подписи занимают равные доли строки. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Для простой задачи достаточно стандартного HStack. Следующий эксперимент с Layout будет воспроизводить понятный результат, а не вводить абстракцию без образца.

Каждый Text сообщает готовность занять доступную ширину через maxWidth infinity. HStack распределяет место между такими детьми. spacing 0 убирает промежутки, поэтому равные доли легче увидеть. Это контрольный результат для сравнения с собственным Layout.

### Шаг 5. Собственный Layout

**Цель:** Собственный Layout.

**Попробуй сам:** Создай EqualWidthHStack с sizeThatFits и placeSubviews. Замени только HStack своей структурой. Обрабатывай пустой набор.

<details>
<summary>Показать решение шага 5</summary>

**EqualWidthHStack.swift** — создай файл и включи его в target приложения.

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
```

В **ContentView.swift** найди этот блок:

```swift
HStack(spacing: 0)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
EqualWidthHStack
```


</details>

**Ожидаемый результат:** Колонки остались равными; изменение окна и крупный текст не обрезают высоту подписей. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Два метода — один неделимый контракт Layout: первый измеряет дочерние элементы с шириной колонки, второй размещает их с тем же предложением. Fallback нужен, когда родитель не указал ширину; guard защищает деление на ноль.

`sizeThatFits` сначала делит предлагаемую ширину на число детей, затем спрашивает нужную высоту каждого при этой ширине и берёт максимум. `placeSubviews` повторяет ту же ширину колонки и смещает x на index × width. Если измерение и размещение используют разные предложения, текст может обрезаться — поэтому обе части проверяются вместе.

## Глубже — необязательно

::: details Глубже: адаптивная компоновка и движение
Для выбора готовой компоновки сначала попробуй ViewThatFits или AnyLayout. Scroll effects и чтение geometry для анимаций — отдельное упражнение с учётом Reduce Motion.
:::

## Самостоятельное изменение

<Challenge>
<template #task>Собери RadialLayout для нескольких кнопок. Сначала вычисли центр и радиус, затем равномерные углы.</template>
<template #knowledge>Используй состояние и функции, которые уже собрал в этом проекте.</template>
<template #hint1>Измерение возвращает размер области; размещение использует угол 2π × index / count.</template>
<template #hint2>Проверь обычный случай и граничные значения; сохрани основной рабочий маршрут.</template>
<template #solution>

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
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Swift").background(.orange)
            Text("SwiftUI")
                .background(.cyan)
                .alignmentGuide(.leading) { dimensions in dimensions[.leading] - 20 }
            EqualWidthHStack {
                ForEach(["Swift", "SwiftUI", "Xcode"], id: \.self) { item in
                    Text(item).frame(maxWidth: .infinity).padding(.vertical)
                        .background(.indigo.opacity(0.15))
                }
            }
            GeometryReader { proxy in
                VStack(alignment: .leading) {
                    Rectangle().fill(.indigo).frame(width: proxy.size.width / 2, height: 30)
                    Text("Ширина: \(proxy.size.width.formatted())")
                }
            }
            .frame(height: 80)
        }
        .padding()
    }
}
```

### LayoutLabApp.swift

```swift
import SwiftUI

@main
struct LayoutLabApp: App {
    var body: some Scene {
        WindowGroup { ContentView() }
    }
}
```

### EqualWidthHStack.swift

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
```

</details>

<ProjectRecap slug="project-18-layout" />

Финальный большой проект объединит navigation и adaptive UI: [SnowSeeker →](/projects/project-19-snowseeker).
