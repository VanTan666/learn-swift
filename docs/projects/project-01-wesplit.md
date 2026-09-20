---
title: Project 1 — WeSplit
description: "Первое SwiftUI-приложение: форма для разделения счёта и расчёта чаевых."
projectSlug: project-01-wesplit
---

# Project 1 — WeSplit

Ты переходишь от основ языка к настоящему интерфейсу. WeSplit получает сумму счёта, число гостей и процент чаевых, а затем показывает общую сумму и сумму с каждого.

<ProjectPrerequisites slug="project-01-wesplit" />

## Стартовая точка

Создай проект **iOS → App** с интерфейсом SwiftUI и открой `ContentView.swift`. На каждом шаге сначала попробуй выполнить задание самостоятельно, затем раскрой решение и проверь ожидаемый результат.

### Шаг 1. Первый View

<span id="content-view"></span>

**Цель:** получить минимальный компилируемый экран приложения.

**Попробуй сам:** оставь в `ContentView.swift` только `import SwiftUI`, `ContentView`, `body` и текст `WeSplit`.

<details>
<summary>Показать решение шага 1</summary>

Замени **ContentView.swift** целиком:

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        Text("WeSplit")
    }
}

#Preview { ContentView() }
```

</details>

**Ожидаемый результат:** приложение запускается и показывает надпись `WeSplit`.

**Новые концепции:** `View`, `body`, `some View`.

`ContentView` — обычный Swift `struct`. Запись `: View` означает соответствие протоколу `View`, а `body` — уже знакомое computed property. Новая часть — `some View`: SwiftUI скрывает точный составной тип возвращаемого интерфейса.

<FamiliarNew
  :familiar="['structs', 'protocols', 'computed-properties']"
  :fresh="['view', 'body', 'some-view']"
  return-to="/projects/project-01-wesplit#content-view"
/>

### Шаг 2. Состояние и поле суммы

<span id="state"></span>

**Цель:** связать ввод пользователя с состоянием SwiftUI.

**Попробуй сам:** добавь `@State` для суммы и `TextField`, который изменяет это значение через binding.

<details>
<summary>Показать решение шага 2</summary>

В **ContentView.swift**, внутри `ContentView`, добавь `checkAmount` перед `body`, затем замени `body` следующим. Импорт и `#Preview` сохрани:

```swift
@State private var checkAmount = 0.0

var body: some View {
    Form {
        TextField("Сумма", value: $checkAmount, format: .number)
            .keyboardType(.decimalPad)
    }
}
```

</details>

**Ожидаемый результат:** в форме появляется поле суммы, в него можно вводить число, а приложение продолжает компилироваться.

**Новые концепции:** `@State`, Binding, `Form` и `TextField`.

`@State` хранит значение, от которого зависит интерфейс. Когда значение меняется, SwiftUI заново вычисляет нужную часть `body`. Обычная stored property здесь не подходит: `View` — структура-значение, а `@State` предоставляет управляемое SwiftUI-хранилище.

`checkAmount` — само значение, а `$checkAmount` — двусторонняя привязка. Поэтому `TextField(value:)` может и прочитать число, и записать новый ввод обратно в `@State`.

<FamiliarNew
  :familiar="['variables', 'double']"
  :fresh="['state', 'binding']"
  return-to="/projects/project-01-wesplit#state"
/>

::: warning Частая ошибка
Не путай `checkAmount` с `$checkAmount`: первое передаёт значение, второе передаёт Binding. Поле ввода, которое должно менять состояние, получает именно `$checkAmount`.
:::

### Шаг 3. Выбор гостей и чаевых

<span id="arrays"></span>
<span id="foreach"></span>

**Цель:** добавить два управляемых выбора без копирования строк вручную.

**Попробуй сам:** добавь состояние для количества гостей и процента чаевых, затем создай два `Picker` с `ForEach`.

<details>
<summary>Показать решение шага 3</summary>

В **ContentView.swift** добавь три свойства перед `body`. Оба `Picker` вставь внутри существующего `Form`, сразу после `TextField` с его modifiers:

```swift
@State private var numberOfPeople = 2
@State private var tipPercentage = 20
private let tips = [0, 10, 15, 20, 25]

Picker("Людей", selection: $numberOfPeople) {
    ForEach(2..<11) { Text("\($0)").tag($0) }
}

Picker("Процент", selection: $tipPercentage) {
    ForEach(tips, id: \.self) { Text("\($0)%") }
}
.pickerStyle(.segmented)
```

</details>

**Ожидаемый результат:** количество гостей и процент чаевых меняются прямо в форме.

**Новые концепции:** `ForEach` и `Picker`. Массивы, диапазоны и trailing closure уже знакомы из Swift-уроков.

Массив `tips` — обычный Swift `Array`; SwiftUI превращает его элементы в варианты интерфейса. `2..<11` — знакомый `Range`, `{ ... }` — trailing closure, а `ForEach` использует их для построения повторяющихся `View`. `$0` обозначает текущий элемент closure.

<FamiliarNew
  :familiar="['arrays', 'ranges', 'closures']"
  :fresh="['foreach', 'picker']"
  return-to="/projects/project-01-wesplit#foreach"
/>

### Шаг 4. Расчёт и навигация

<span id="computed-properties"></span>

**Цель:** вывести сумму на человека и оформить экран как законченную форму.

**Попробуй сам:** добавь computed property `totalPerPerson`, секцию результата, `NavigationStack` и заголовок. Проверь сумму `1000`, двух гостей и `20%` чаевых.

<details>
<summary>Показать решение шага 4</summary>

В **ContentView.swift** добавь `totalPerPerson` перед `body` и замени `body` целиком. Здесь меняется вложенность формы, поэтому ниже показана вся разметка с уже знакомыми полями:

```swift
private var totalPerPerson: Double {
    let total = checkAmount * (1 + Double(tipPercentage) / 100)
    return total / Double(numberOfPeople)
}

var body: some View {
    NavigationStack {
        Form {
            TextField("Сумма", value: $checkAmount, format: .number)
                .keyboardType(.decimalPad)
            Picker("Людей", selection: $numberOfPeople) {
                ForEach(2..<11) { Text("\($0)").tag($0) }
            }
            Picker("Процент", selection: $tipPercentage) {
                ForEach(tips, id: \.self) { Text("\($0)%") }
            }
            .pickerStyle(.segmented)
            Section("С каждого") {
                Text(totalPerPerson, format: .number)
            }
        }
        .navigationTitle("WeSplit")
    }
}
```

</details>

**Ожидаемый результат:** при сумме `1000`, двух людях и чаевых `20%` расчёт даёт `600` с человека. Формат валюты добавим на следующем шаге.

**Новые концепции:** `NavigationStack` и `Section`. Computed property знакомо из Swift, а Form появился на шаге 2.

`totalPerPerson` ничего не хранит: computed property получает результат из текущего состояния при каждом обращении. `NavigationStack` создаёт контекст навигации, `Form` раскладывает controls по системной форме, а `Section` объединяет связанные поля.

📚 [Повторить computed properties →](/swift/day-010-structs-part1?returnTo=%2Fprojects%2Fproject-01-wesplit%23computed-properties)

### Шаг 5. Валюта и клавиатура

<span id="formatting"></span>

**Цель:** сделать отображение валюты зависимым от локали и дать пользователю способ закрыть клавиатуру.

**Попробуй сам:** добавь `currencyCode` с запасным значением `USD`, передай его в формат суммы с каждого и свяжи поле с `@FocusState`. Пока поле в фокусе, покажи кнопку `Готово` в toolbar.

<details>
<summary>Показать решение шага 5</summary>

В **ContentView.swift**, внутри `ContentView`, добавь свойства перед `body`:

```swift
private let currencyCode = Locale.current.currency?.identifier ?? "USD"
@FocusState private var amountIsFocused: Bool
```

Внутри `Form` замени существующий `TextField` со всеми его modifiers:

```swift
TextField("Сумма", value: $checkAmount, format: .currency(code: currencyCode))
    .keyboardType(.decimalPad)
    .focused($amountIsFocused)
```

В секции «С каждого» замени строку `Text(totalPerPerson, format: .number)`:

```swift
Text(totalPerPerson, format: .currency(code: currencyCode))
```

Сразу после `.navigationTitle("WeSplit")` добавь:

```swift
.toolbar {
    if amountIsFocused {
        Button("Готово") { amountIsFocused = false }
    }
}
```

</details>

**Ожидаемый результат:** суммы форматируются в валюте текущей локали, а кнопка `Готово` скрывает клавиатуру.

**Новые концепции:** `Locale`, `@FocusState` и toolbar. Optional chaining повторяет материал Swift-урока об optionals.

`Locale.current.currency?.identifier` может не вернуть валюту, поэтому optional chaining `?.` безопасно проходит к `identifier`, а `?? "USD"` задаёт запасной код. `@FocusState` похож на `@State`, но описывает, какой control сейчас принимает ввод.

<Checkpoint>

Собери приложение до этого состояния самостоятельно. Проверь сценарий `1000` → `2` гостя → `20%` чаевых, затем измени локаль или код валюты и проверь форматирование.

</Checkpoint>

<Challenge>
<template #task>

Добавь проверку нулевых чаевых: если выбран `0%`, выдели сумму с каждого заметным цветом. Затем добавь отдельную строку с общей суммой до разделения.

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
private var totalAmount: Double {
    checkAmount * (1 + Double(tipPercentage) / 100)
}

Section("Итого") {
    Text("Всего")
    Text(totalAmount, format: .currency(code: currencyCode))
    Text("С каждого")
    Text(totalPerPerson, format: .currency(code: currencyCode))
        .foregroundStyle(tipPercentage == 0 ? .red : .primary)
}
```

</template>
</Challenge>

## Reference: полный код проекта

Основной маршрут до самостоятельного challenge. Все файлы нового проекта; сгенерированный Xcode `WeSplitApp.swift` замени, не добавляй вторую точку входа.

<details>
<summary>Открыть все итоговые файлы</summary>

### ContentView.swift

```swift
import SwiftUI

struct ContentView: View {
    @State private var checkAmount = 0.0
    @State private var numberOfPeople = 2
    @State private var tipPercentage = 20
    private let tips = [0, 10, 15, 20, 25]
    private let currencyCode = Locale.current.currency?.identifier ?? "USD"
    @FocusState private var amountIsFocused: Bool
    private var totalPerPerson: Double {
        let total = checkAmount * (1 + Double(tipPercentage) / 100)
        return total / Double(numberOfPeople)
    }

    var body: some View {
        NavigationStack {
            Form {
                TextField("Сумма", value: $checkAmount, format: .currency(code: currencyCode))
                    .keyboardType(.decimalPad)
                    .focused($amountIsFocused)
                Picker("Людей", selection: $numberOfPeople) {
                    ForEach(2..<11) { Text("\($0)").tag($0) }
                }
                Picker("Процент", selection: $tipPercentage) {
                    ForEach(tips, id: \.self) { Text("\($0)%") }
                }
                .pickerStyle(.segmented)
                Section("С каждого") {
                    Text(totalPerPerson, format: .currency(code: currencyCode))
                }
            }
            .navigationTitle("WeSplit")
            .toolbar {
                if amountIsFocused {
                    Button("Готово") { amountIsFocused = false }
                }
            }
        }
    }
}

#Preview { ContentView() }
```

### WeSplitApp.swift

```swift
import SwiftUI
@main
struct WeSplitApp: App {
    var body: some Scene {
        WindowGroup { ContentView() }
    }
}
```

</details>

<ProjectRecap slug="project-01-wesplit" />

::: tip Что получилось
Ты использовал знакомые Swift-концепции для управления настоящим интерфейсом: `@State` связал ввод с экраном, `Array` и `Range` наполнили `Picker`, `ForEach` построил повторяющиеся элементы, а computed properties рассчитали итог. `Locale` и `@FocusState` сделали форму удобнее для реального пользователя.
:::

## Следующий проект

В **Project 2 — Guess the Flag** появятся `VStack`, `HStack`, `ZStack`, изображения, кнопки и alerts. [Продолжить обучение →](/continue)
