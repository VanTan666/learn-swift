---
title: Project 3 — Views and Modifiers
description: Как устроены View, composition и custom modifiers.
projectSlug: project-03-views-and-modifiers
---

# Project 3 — Views and Modifiers

Это технический проект без одного большого приложения. Мы разберём правила, которые уже использовали в WeSplit и Guess the Flag, и научимся собирать небольшие View в понятные компоненты.

<ProjectPrerequisites slug="project-03-views-and-modifiers" />

## Стартовая точка

Создай новый **iOS → App** с именем **ViewsAndModifiers** и интерфейсом SwiftUI. В сгенерированном `ContentView.swift` оставь минимальное состояние ниже. Сохрани файл `ViewsAndModifiersApp.swift`, созданный Xcode; если шаг меняет точку входа, замени существующий файл, не создавай второй `@main`.

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        Text("Начало")
    }
}
```

Сначала прочитай задание шага и попробуй выполнить его. Решение закрыто: открой его для сверки или если застрял. Применяй изменения по порядку — каждый шаг опирается на предыдущий.

### Шаг 1. Счётчик на знакомом состоянии

**Цель:** Счётчик на знакомом состоянии.

**Попробуй сам:** Покажи число и кнопку увеличения. Используй @State и VStack из прошлых проектов.

<details>
<summary>Показать решение шага 1</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var count = 0
```

В **ContentView.swift** найди этот блок:

```swift
Text("Начало")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
VStack(spacing: 20) {
            Text(count, format: .number)
            Button("Увеличить") { count += 1 }
        }
        .padding()
```


</details>

**Ожидаемый результат:** Каждый tap увеличивает число на один. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Повторение: состояние хранится у владельца экрана. Новых механизмов хранения здесь нет; этот короткий экран станет материалом для дальнейшего выделения компонентов.

`count += 1` выполняется только в действии кнопки. Когда SwiftUI снова читает `body`, он получает новое число и строит соответствующее описание экрана. Не записывай увеличение счётчика прямо внутри вычисления `body`: чтение интерфейса не должно само менять данные. Проверь три нажатия — результат должен быть ровно 3.

### Шаг 2. Порядок modifiers

**Цель:** Порядок modifiers.

**Попробуй сам:** Оформи число как карточку: заголовок, крупное значение, padding и фон. Попробуй переставить padding и background, сравни границы и верни фон после padding.

<details>
<summary>Показать решение шага 2</summary>

В **ContentView.swift** найди этот блок:

```swift
Text(count, format: .number)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
VStack(alignment: .leading) {
                Text("Нажатий").foregroundStyle(.secondary)
                Text(count, format: .number).font(.largeTitle.bold())
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding()
            .background(.indigo.opacity(0.12))
            .clipShape(.rect(cornerRadius: 16))
```


</details>

**Ожидаемый результат:** Фон покрывает текст вместе с внутренними отступами. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Каждый modifier возвращает новый View. Фон относится к результату предыдущих операций, поэтому перестановка меняет область заливки; View остаётся описанием интерфейса в struct.

Мысленно читай цепочку снизу вверх как вложенные обёртки: background окрашивает результат frame и padding, а clipShape обрезает уже оформленную область. Если поставить background перед padding, появится внешний неокрашенный отступ. Это не особое поведение карточки, а общее правило порядка modifiers.

### Шаг 3. Компонент StatCard

**Цель:** Компонент StatCard.

**Попробуй сам:** Вынеси карточку в отдельный struct с параметрами title и value. Оставь count у ContentView.

<details>
<summary>Показать решение шага 3</summary>

**StatCard.swift** — создай файл и включи его в target приложения.

```swift
import SwiftUI

struct StatCard: View {
    let title: String
    let value: Int

    var body: some View {
        VStack(alignment: .leading) {
            Text(title).foregroundStyle(.secondary)
            Text(value, format: .number).font(.largeTitle.bold())
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(.indigo.opacity(0.12))
        .clipShape(.rect(cornerRadius: 16))
    }
}
```

В **ContentView.swift** найди этот блок:

```swift
VStack(alignment: .leading) {
                Text("Нажатий").foregroundStyle(.secondary)
                Text(count, format: .number).font(.largeTitle.bold())
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding()
            .background(.indigo.opacity(0.12))
            .clipShape(.rect(cornerRadius: 16))
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
StatCard(title: "Нажатий", value: count)
```


</details>

**Ожидаемый результат:** Карточка выглядит так же и продолжает обновляться по кнопке. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Composition собирает экран из небольших View. В дочерний компонент передаётся значение, а не отдельный @State: у счётчика остаётся один владелец.

Синтезированный initializer позволяет написать `StatCard(title: "Нажатий", value: count)` без отдельного `init`. Свойства `let` означают, что карточка сама не меняет входные данные. Родитель может передать другое значение при следующем обновлении. Попробуй временно показать вторую карточку с константой 10: она останется неподвижной, пока первая считает нажатия.

### Шаг 4. Поведение нажатой кнопки

**Цель:** Поведение нажатой кнопки.

**Попробуй сам:** Создай PrimaryButtonStyle. Оформи широкую indigo-кнопку с белым текстом; при удержании немного уменьши её масштаб.

<details>
<summary>Показать решение шага 4</summary>

**PrimaryButtonStyle.swift** — создай файл и включи его в target приложения.

```swift
import SwiftUI

struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headline)
            .frame(maxWidth: .infinity)
            .padding()
            .background(configuration.isPressed ? .indigo.opacity(0.7) : .indigo)
            .foregroundStyle(.white)
            .clipShape(.rect(cornerRadius: 12))
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
    }
}
```

В **ContentView.swift** найди этот блок:

```swift
Button("Увеличить") { count += 1 }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
Button("Увеличить") { count += 1 }
                .buttonStyle(PrimaryButtonStyle())
```


</details>

**Ожидаемый результат:** Кнопка реагирует на удержание и по-прежнему увеличивает count. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** `ButtonStyle` получает configuration с label и isPressed. Стиль отвечает за визуальную реакцию кнопки, action остаётся в ContentView.

SwiftUI вызывает `makeBody(configuration:)` и даёт исходный label кнопки. `configuration.isPressed` становится true на время удержания пальца; это готовое состояние, его не надо дублировать в `@State`. `.scaleEffect(0.98)` означает 98% обычного размера. Стиль не содержит `count += 1`, поэтому подходит и кнопке с другим действием.

### Шаг 5. Переиспользуемый ViewModifier

**Цель:** Переиспользуемый ViewModifier.

**Попробуй сам:** Вынеси оформление заголовка карточки в ProminentTitle и extension View. Примени к Text(title).

<details>
<summary>Показать решение шага 5</summary>

**ProminentTitle.swift** — создай файл и включи его в target приложения.

```swift
import SwiftUI
struct ProminentTitle: ViewModifier {
    func body(content: Content) -> some View {
        content.font(.headline).foregroundStyle(.blue)
    }
}
extension View {
    func prominentTitle() -> some View { modifier(ProminentTitle()) }
}
```

В **StatCard.swift** найди этот блок:

```swift
Text(title).foregroundStyle(.secondary)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
Text(title).prominentTitle()
```


</details>

**Ожидаемый результат:** Заголовок карточки стал синим и выделен headline, число и кнопка работают как прежде. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** `ViewModifier` преобразует переданный content. Extension добавляет короткий метод вызова. Здесь достаточно конкретного StatCard; generic-контейнеры пока не нужны.

В `body(content:)` параметр `content` — оформляемый View. Возвращая `content.font(...).foregroundStyle(...)`, modifier добавляет две настройки. Extension только сокращает вызов `modifier(ProminentTitle())` до `.prominentTitle()`. Отличие от StatCard: modifier не создаёт отдельную модель карточки, а оформляет переданное содержимое.

## Глубже — необязательно

::: details Глубже: generic containers
После Day 18 можно обобщить контейнер для произвольного содержимого через generics и `@ViewBuilder`. Здесь конкретный `StatCard` полностью решает задачу.
:::

## Самостоятельное изменение

<Challenge>
<template #task>Создай modifier для крупной синей кнопки с белым текстом, padding и capsule shape. Примени его к двум разным `Button`.</template>
<template #knowledge>Structs, protocols, extensions и порядок modifiers.</template>
<template #hint1>Создай `struct PrimaryButton: ViewModifier`.</template>
<template #hint2>Добавь extension `View` с method `primaryButton()`.</template>
<template #solution>

```swift
struct PrimaryButton: ViewModifier {
    func body(content: Content) -> some View {
        content.padding().frame(maxWidth: .infinity)
            .foregroundStyle(.white).background(.blue).clipShape(.capsule)
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
    @State private var count = 0

    var body: some View {
        VStack(spacing: 20) {
            StatCard(title: "Нажатий", value: count)
            Button("Увеличить") { count += 1 }
                .buttonStyle(PrimaryButtonStyle())
        }
        .padding()
    }
}
```

### ViewsAndModifiersApp.swift

```swift
import SwiftUI

@main
struct ViewsAndModifiersApp: App {
    var body: some Scene {
        WindowGroup { ContentView() }
    }
}
```

### StatCard.swift

```swift
import SwiftUI

struct StatCard: View {
    let title: String
    let value: Int

    var body: some View {
        VStack(alignment: .leading) {
            Text(title).prominentTitle()
            Text(value, format: .number).font(.largeTitle.bold())
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(.indigo.opacity(0.12))
        .clipShape(.rect(cornerRadius: 16))
    }
}
```

### PrimaryButtonStyle.swift

```swift
import SwiftUI

struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headline)
            .frame(maxWidth: .infinity)
            .padding()
            .background(configuration.isPressed ? .indigo.opacity(0.7) : .indigo)
            .foregroundStyle(.white)
            .clipShape(.rect(cornerRadius: 12))
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
    }
}
```

### ProminentTitle.swift

```swift
import SwiftUI
struct ProminentTitle: ViewModifier {
    func body(content: Content) -> some View {
        content.font(.headline).foregroundStyle(.blue)
    }
}
extension View {
    func prominentTitle() -> some View { modifier(ProminentTitle()) }
}
```

</details>

<ProjectRecap slug="project-03-views-and-modifiers" />

Теперь базовый набор SwiftUI собран. Закрепи его в [Milestone Projects 1–3 →](/projects/milestone-01-03).
