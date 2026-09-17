---
title: Project 1 — WeSplit
description: "Первое SwiftUI-приложение: форма для разделения счёта и расчёта чаевых."
projectSlug: project-01-wesplit
---

# Project 1 — WeSplit

Ты переходишь от основ языка к настоящему интерфейсу. WeSplit получает сумму счёта, число гостей и процент чаевых, а затем показывает, сколько должен заплатить каждый.

<ProjectPrerequisites slug="project-01-wesplit" />

## Рабочий vertical slice

Замените `ContentView.swift` этим кодом и запустите приложение. Сначала получите работающий расчёт, затем разбирайте части ниже.

```swift
import SwiftUI

struct ContentView: View {
    @State private var checkAmount = 0.0
    @State private var numberOfPeople = 2
    @State private var tipPercentage = 20

    private let tips = [0, 10, 15, 20, 25]

    private var totalPerPerson: Double {
        let total = checkAmount * (1 + Double(tipPercentage) / 100)
        return total / Double(numberOfPeople)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Счёт") {
                    TextField("Сумма", value: $checkAmount, format: .number)
                        .keyboardType(.decimalPad)

                    Picker("Людей", selection: $numberOfPeople) {
                        ForEach(2..<11) { Text("\($0)").tag($0) }
                    }
                }

                Section("Чаевые") {
                    Picker("Процент", selection: $tipPercentage) {
                        ForEach(tips, id: \.self) { Text("\($0)%") }
                    }
                    .pickerStyle(.segmented)
                }

                Section("С каждого") {
                    Text(totalPerPerson, format: .currency(code: "RUB"))
                }
            }
            .navigationTitle("WeSplit")
        }
    }
}

#Preview { ContentView() }
```

Ожидаемый результат: при сумме `1000`, двух людях и чаевых `20%` получится `600 ₽` с человека.

## От Swift к SwiftUI

**Swift** — язык программирования. **SwiftUI** — framework для создания интерфейсов с помощью Swift. Переменные, Arrays, closures, structs, protocols и optionals никуда не исчезают: теперь они управляют экраном приложения.

```text
Swift: variables → arrays → closures → structs → protocols → optionals
                                      ↓
SwiftUI: View → @State → Form → Picker → NavigationStack
                                      ↓
                                   WeSplit
```

Открой Xcode и создай проект **iOS → App**. Выбери Interface: **SwiftUI** и Language: **Swift**. Работать будем в `ContentView.swift`.

<span id="content-view"></span>
## Первый View: знакомый Swift плюс одна новая идея

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        Text("Hello, world!")
    }
}
```

`ContentView` — обычный Swift `struct`. Запись `: View` означает соответствие protocol `View`. `body` — computed property. Новое здесь — `some View`: свойство возвращает один конкретный тип интерфейса, но SwiftUI скрывает его длинное точное имя.

<FamiliarNew
  :familiar="['structs', 'protocols', 'computed-properties']"
  :fresh="['view', 'body', 'some-view']"
  return-to="/projects/project-01-wesplit#content-view"
/>

::: tip Педагогический мост
Не нужно заново учить `struct` или properties. Повтори их по ссылкам, если детали забылись, а здесь сосредоточься на `View`.
:::

<span id="state"></span>
## Состояние интерфейса: `@State`

```swift
@State private var checkAmount = 0.0
@State private var numberOfPeople = 2
@State private var tipPercentage = 20
```

`var`, `private` и type inference уже знакомы. `@State` — новая SwiftUI-часть: она хранит значение, от которого зависит интерфейс. Когда значение меняется, SwiftUI заново вычисляет нужную часть `body`.

<FamiliarNew
  :familiar="['variables', 'double']"
  :fresh="['state']"
  return-to="/projects/project-01-wesplit#state"
/>

Не пытайся менять обычную stored property внутри `View`: структуры считаются значениями. `@State` предоставляет SwiftUI отдельное управляемое хранилище.

<span id="arrays"></span>
## Данные для Picker — обычный Array

```swift
let tipPercentages = [10, 15, 20, 25, 0]
```

Здесь нет новой магии: это Swift Array из Day 3. SwiftUI просто читает элементы и превращает их в варианты интерфейса.

## Form, Section и NavigationStack

```swift
NavigationStack {
    Form {
        Section("Сумма счёта") {
            TextField("Amount", value: $checkAmount, format: .currency(code: currencyCode))
                .keyboardType(.decimalPad)
        }
    }
    .navigationTitle("WeSplit")
}
```

`NavigationStack` создаёт навигационный контекст и место для заголовка. `Form` раскладывает controls в системную форму, а `Section` объединяет связанные поля. `$checkAmount` создаёт **Binding (привязку)**: `TextField` может не только прочитать число, но и записать новое значение обратно в `@State`.

::: warning Частая ошибка
`checkAmount` — само значение. `$checkAmount` — двусторонняя привязка к нему. `TextField(value:)` нужен именно Binding.
:::

<span id="foreach"></span>
## Range и closure внутри `ForEach`

```swift
Picker("Количество людей", selection: $numberOfPeople) {
    ForEach(2..<100) {
        Text("\($0) people")
    }
}
```

Разложим строку:

- `2..<100` — Swift Range из Day 6: числа от 2 до 99;
- `{ ... }` — trailing closure из Day 9;
- `$0` — shorthand parameter closure;
- `ForEach` — SwiftUI View, который строит дочерний View для каждого элемента.

<FamiliarNew
  :familiar="['ranges', 'closures']"
  :fresh="['foreach', 'picker', 'binding']"
  return-to="/projects/project-01-wesplit#foreach"
/>

Получается важная формула: знакомые Range и closure + новый `ForEach` = повторяющийся интерфейс.

<span id="computed-properties"></span>
## Расчёт суммы через computed property

Сначала попробуй самостоятельно создать `totalPerPerson`: вычисли чаевые, прибавь их к счёту и раздели результат на количество людей.

<details>
<summary>Показать подсказку</summary>

Помни, что `numberOfPeople` уже содержит реальное число людей, если Picker работает с диапазоном `2..<100`. Переведи целые числа в `Double` перед делением.

</details>

<details>
<summary>Показать код</summary>

```swift
var totalPerPerson: Double {
    let peopleCount = Double(numberOfPeople)
    let tipSelection = Double(tipPercentage)
    let tipValue = checkAmount / 100 * tipSelection
    let grandTotal = checkAmount + tipValue

    return grandTotal / peopleCount
}
```

</details>

Это тот же computed property, что в Day 10: он ничего не хранит, а каждый раз получает результат из текущего состояния. UI выводит его напрямую:

📚 [Повторить computed properties →](/swift/day-010-structs-part1?returnTo=%2Fprojects%2Fproject-01-wesplit%23computed-properties)

```swift
Text(totalPerPerson, format: .currency(code: currencyCode))
```

<span id="formatting"></span>
## Формат валюты и Optional

```swift
let currencyCode = Locale.current.currency?.identifier ?? "USD"
```

`currency` может отсутствовать, поэтому optional chaining `?.` безопасно запрашивает `identifier`, а `??` подставляет запасной код. Это прямое применение Day 14 в реальном приложении.

## Скрываем клавиатуру с `@FocusState`

```swift
@FocusState private var amountIsFocused: Bool
```

Свяжи focus с полем и добавь кнопку в toolbar:

```swift
TextField("Amount", value: $checkAmount, format: .currency(code: currencyCode))
    .focused($amountIsFocused)

.toolbar {
    if amountIsFocused {
        Button("Done") {
            amountIsFocused = false
        }
    }
}
```

`@FocusState` похож на `@State`, но описывает, какой control сейчас принимает ввод.

<Challenge>
<template #task>

Добавь проверку нулевых чаевых. Если выбран `0%`, выдели итоговую сумму заметным цветом. Затем добавь отдельную строку с общей суммой до разделения.

</template>
<template #knowledge>

- условие `if` из Day 5;
- computed properties из Day 10;
- conditional modifier через ternary operator.

</template>
<template #hint1>

Общая сумма равна `checkAmount + tipValue`. Вынеси её в отдельную computed property, чтобы расчёт не дублировался.

</template>
<template #hint2>

Цвет можно выбрать выражением `tipPercentage == 0 ? .red : .primary`.

</template>
<template #solution>

```swift
var totalAmount: Double {
    let tipValue = checkAmount / 100 * Double(tipPercentage)
    return checkAmount + tipValue
}

Text(totalPerPerson, format: .currency(code: currencyCode))
    .foregroundStyle(tipPercentage == 0 ? .red : .primary)
```

</template>
</Challenge>

<ProjectRecap slug="project-01-wesplit" />

::: tip Что получилось
Ты использовал обычный Swift для управления настоящим интерфейсом: Array наполнил Picker, Range и closure построили строки `ForEach`, computed property выполнил расчёт, protocol `View` описал экран, а Optional помог выбрать валюту.
:::

## Следующий проект

В **Project 2 — Guess the Flag** появятся `VStack`, `HStack`, `ZStack`, изображения, кнопки и alerts. [Продолжить обучение →](/continue)
