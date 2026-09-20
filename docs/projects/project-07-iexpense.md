---
title: Project 7 — iExpense
description: Трекер расходов с observation, sheet, Codable и UserDefaults.
projectSlug: project-07-iexpense
---

# Project 7 — iExpense

iExpense хранит личные и рабочие расходы, добавляет записи на отдельном экране и сохраняет их между запусками. Проект вводит shared reference state и persistence.

<ProjectPrerequisites slug="project-07-iexpense" />

## Стартовая точка

Создай новый **iOS → App** с именем **iExpense** и интерфейсом SwiftUI. В сгенерированном `ContentView.swift` оставь минимальное состояние ниже. Сохрани файл `iExpenseApp.swift`, созданный Xcode; если шаг меняет точку входа, замени существующий файл, не создавай второй `@main`.

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        Text("Начало")
    }
}
```

Сначала прочитай задание шага и попробуй выполнить его. Решение закрыто: открой его для сверки или если застрял. Применяй изменения по порядку — каждый шаг опирается на предыдущий.

### Шаг 1. Расход как значение

**Цель:** Расход как значение.

**Попробуй сам:** Создай ExpenseItem с id, name и amount. Покажи тестовую запись через List и ForEach.

<details>
<summary>Показать решение шага 1</summary>

**ExpenseItem.swift** — создай файл и включи его в target приложения.

```swift
import Foundation
struct ExpenseItem: Identifiable, Codable {
    var id = UUID()
    let name: String
    let amount: Double
}
```

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var items = [ExpenseItem(name: "Кофе", amount: 250)]
```

В **ContentView.swift** найди этот блок:

```swift
Text("Начало")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
NavigationStack {
            List {
                ForEach(items) { item in
                    HStack {
                        Text(item.name)
                        Spacer()
                        Text(item.amount, format: .currency(code: "RUB"))
                    }
                }
            }
            .navigationTitle("iExpense")
        }
```


</details>

**Ожидаемый результат:** В списке видны название и сумма каждого расхода. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** `Identifiable` даёт строке стабильный UUID; имя расхода не подходит как id, потому что может повторяться. Пока данные принадлежат одному экрану.

Один расход — одна структура, а массив содержит набор таких значений. UUID создаётся при создании записи и не меняется при обновлении строки. У суммы тип Double, поэтому можно вводить дробные значения. В основной сборке категория ещё не нужна: её добавление останется самостоятельным упражнением.

### Шаг 2. Один observable-владелец

**Цель:** Один observable-владелец.

**Попробуй сам:** Перенеси массив в @Observable class Expenses. Создай один экземпляр в @State ContentView и прочитай из него items.

<details>
<summary>Показать решение шага 2</summary>

**Expenses.swift** — создай файл и включи его в target приложения.

```swift
import Observation
@Observable
final class Expenses {
    var items = [ExpenseItem(name: "Кофе", amount: 250)]
}
```

В **ContentView.swift** найди этот блок:

```swift
    @State private var items = [ExpenseItem(name: "Кофе", amount: 250)]
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
    @State private var expenses = Expenses()
```

В **ContentView.swift** найди этот блок:

```swift
ForEach(items)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
ForEach(expenses.items)
```


</details>

**Ожидаемый результат:** Список выглядит по-прежнему; все расходы теперь принадлежат объекту Expenses. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Класс имеет общую идентичность. @State удерживает экземпляр у владельца, @Observable отслеживает чтение properties. Перед этим шагом повтори bridge-урок Observation из prerequisites.

Если создать `Expenses()` отдельно для каждого экрана, получится два разных массива. Поэтому объект создаётся один раз у ContentView и позже передаётся дальше. `@Observable` не сохраняет данные на диск: он только помогает интерфейсу замечать изменения. Перезапуск на этом этапе всё ещё возвращает тестовые данные.

### Шаг 3. Форма в sheet

**Цель:** Форма в sheet.

**Попробуй сам:** Создай AddExpenseView с полями названия и суммы. По кнопке «Добавить» покажи sheet. Пока закрой его системным свайпом.

<details>
<summary>Показать решение шага 3</summary>

**AddExpenseView.swift** — создай файл и включи его в target приложения.

```swift
import SwiftUI
struct AddExpenseView: View {
    @State private var name = ""
    @State private var amount = 0.0
    var body: some View {
        NavigationStack {
            Form {
                TextField("Название", text: $name)
                TextField("Сумма", value: $amount, format: .number)
                    .keyboardType(.decimalPad)
            }
            .navigationTitle("Новый расход")
        }
    }
}
```

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var showingAdd = false
```

В **ContentView.swift** найди этот блок:

```swift
.navigationTitle("iExpense")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
.navigationTitle("iExpense")
            .toolbar { Button("Добавить") { showingAdd = true } }
            .sheet(isPresented: $showingAdd) { AddExpenseView() }
```


</details>

**Ожидаемый результат:** Sheet открывается, поля редактируются, основной список не меняется. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Sheet — отдельный временный экран. Поля формы локальны для него; ещё не подтверждённый ввод не должен сразу изменять список.

`showingAdd` — состояние презентации у родителя, а `name` и `amount` принадлежат форме. Закрытие без подтверждения уничтожит этот несохранённый ввод, что здесь ожидаемо. Пока форма не получает Expenses, у неё даже нет возможности случайно изменить основную коллекцию.

### Шаг 4. Сохранение формы в общую модель

**Цель:** Сохранение формы в общую модель.

**Попробуй сам:** Передай тот же Expenses в AddExpenseView. Кнопка «Сохранить» добавляет запись и закрывает форму; пустое имя и неположительная сумма запрещены.

<details>
<summary>Показать решение шага 4</summary>

В **AddExpenseView.swift** добавь код перед строкой `var body: some View {`:

```swift
    let expenses: Expenses
    @Environment(\.dismiss) private var dismiss
```

В **AddExpenseView.swift** найди этот блок:

```swift
.navigationTitle("Новый расход")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
.navigationTitle("Новый расход")
            .toolbar {
                Button("Сохранить") {
                    expenses.items.append(ExpenseItem(name: name, amount: amount))
                    dismiss()
                }
                .disabled(name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || amount <= 0)
            }
```

В **ContentView.swift** найди этот блок:

```swift
AddExpenseView()
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
AddExpenseView(expenses: expenses)
```


</details>

**Ожидаемый результат:** Новая запись появляется на основном экране сразу после закрытия sheet. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Дочерний экран получает объект обычным let: второй @State не нужен. @Environment dismiss даёт действие закрытия. @Bindable понадобился бы для прямого Binding к property объекта, но здесь мы вызываем append.

`dismiss` — действие из окружения текущего sheet. Оно вызывается после append, поэтому родитель уже читает обновлённый массив, когда форма закрывается. Проверка `.disabled` вычисляется заново при каждом вводе; отдельный флаг валидности не нужен. Проверь пустое имя, пробелы, нулевую и положительную сумму.

### Шаг 5. Удаление и пустой список

**Цель:** Удаление и пустой список.

**Попробуй сам:** Подключи onDelete к ForEach и покажи ContentUnavailableView, когда массив пуст.

<details>
<summary>Показать решение шага 5</summary>

В **ContentView.swift** найди этот блок:

```swift
                }
            }
            .navigationTitle("iExpense")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
                }
                .onDelete { expenses.items.remove(atOffsets: $0) }
            }
            .overlay {
                if expenses.items.isEmpty {
                    ContentUnavailableView("Расходов нет", systemImage: "creditcard")
                }
            }
            .navigationTitle("iExpense")
```


</details>

**Ожидаемый результат:** Свайп удаляет запись, удаление последней показывает «Расходов нет». Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** onDelete сообщает IndexSet исходного ForEach. Пока список не фильтруется, эти индексы совпадают с массивом модели; после фильтрации удалять нужно по id.

`atOffsets` принимает набор индексов, потому что системное удаление может выбрать несколько строк. Подключай onDelete именно к ForEach, описывающему эти строки. При пустом массиве overlay объясняет отсутствие данных, но кнопка добавления в toolbar остаётся доступной — ученик не попадает в тупик.

### Шаг 6. JSON между запусками

**Цель:** JSON между запусками.

**Попробуй сам:** В Expenses декодируй сохранённый массив из UserDefaults при создании. После изменения items кодируй его обратно. Ошибку чтения или кодирования покажи через alert.

<details>
<summary>Показать решение шага 6</summary>

**Expenses.swift** — замени файл целиком; здесь меняется его связная структура.

```swift
import Foundation
import Observation


@Observable
final class Expenses {
    var items: [ExpenseItem] = [] { didSet { save() } }
    var persistenceError: String?

    init() {
        guard let data = UserDefaults.standard.data(forKey: "expenses") else { return }

        do {
            items = try JSONDecoder().decode([ExpenseItem].self, from: data)
        } catch {
            persistenceError = "Не удалось прочитать сохранённые расходы: \(error.localizedDescription)"
        }
    }

    private func save() {
        do {
            let data = try JSONEncoder().encode(items)
            UserDefaults.standard.set(data, forKey: "expenses")
            persistenceError = nil
        } catch {
            persistenceError = "Не удалось сохранить расходы: \(error.localizedDescription)"
        }
    }
}
```

В **ContentView.swift** найди этот блок:

```swift
.navigationTitle("iExpense")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
.navigationTitle("iExpense")
            .alert("Ошибка данных", isPresented: Binding(
                get: { expenses.persistenceError != nil },
                set: { if !$0 { expenses.persistenceError = nil } }
            )) { Button("OK") { expenses.persistenceError = nil } }
            message: { Text(expenses.persistenceError ?? "") }
```


</details>

**Ожидаемый результат:** Добавленные расходы сохраняются после закрытия и открытия приложения; ошибка данных не исчезает молча. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Codable преобразует массив в Data. didSet реагирует на изменение items. Здесь небольшой учебный массив; ошибки чтения и записи имеют отдельное видимое состояние.

`JSONEncoder().encode(items)` возвращает Data, а decoder восстанавливает тот же тип `[ExpenseItem]`. Ключ `expenses` при чтении и записи должен совпадать. В init отсутствующий ключ означает первый запуск и не является ошибкой; существующие повреждённые данные — уже другая ситуация, которую показывает persistenceError.

## Самостоятельное изменение

<Challenge>
<template #task>Добавь категории «Личное» и «Работа», затем покажи расходы отдельными секциями.</template>
<template #knowledge>Используй состояние и функции, которые уже собрал в этом проекте.</template>
<template #hint1>Добавь type с default в ExpenseItem и Picker в форму. При удалении из фильтра ищи исходную запись по id.</template>
<template #hint2>Проверь обычный случай и граничные значения; сохрани основной рабочий маршрут.</template>
<template #solution>

```swift
// Property ExpenseItem с default сохраняет совместимость новой записи:
var type = "Личное"
// Для секции вычисляй:
expenses.items.filter { $0.type == "Личное" }
// Для выбранного item удаляй из исходного массива:
expenses.items.removeAll { $0.id == item.id }
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
    @State private var expenses = Expenses()

    @State private var showingAdd = false

    var body: some View {
        NavigationStack {
            List {
                ForEach(expenses.items) { item in
                    HStack {
                        Text(item.name)
                        Spacer()
                        Text(item.amount, format: .currency(code: "RUB"))
                    }
                }
                .onDelete { expenses.items.remove(atOffsets: $0) }
            }
            .overlay {
                if expenses.items.isEmpty {
                    ContentUnavailableView("Расходов нет", systemImage: "creditcard")
                }
            }
            .navigationTitle("iExpense")
            .alert("Ошибка данных", isPresented: Binding(
                get: { expenses.persistenceError != nil },
                set: { if !$0 { expenses.persistenceError = nil } }
            )) { Button("OK") { expenses.persistenceError = nil } }
            message: { Text(expenses.persistenceError ?? "") }
            .toolbar { Button("Добавить") { showingAdd = true } }
            .sheet(isPresented: $showingAdd) { AddExpenseView(expenses: expenses) }
        }
    }
}
```

### iExpenseApp.swift

```swift
import SwiftUI

@main
struct iExpenseApp: App {
    var body: some Scene {
        WindowGroup { ContentView() }
    }
}
```

### ExpenseItem.swift

```swift
import Foundation
struct ExpenseItem: Identifiable, Codable {
    var id = UUID()
    let name: String
    let amount: Double
}
```

### Expenses.swift

```swift
import Foundation
import Observation


@Observable
final class Expenses {
    var items: [ExpenseItem] = [] { didSet { save() } }
    var persistenceError: String?

    init() {
        guard let data = UserDefaults.standard.data(forKey: "expenses") else { return }

        do {
            items = try JSONDecoder().decode([ExpenseItem].self, from: data)
        } catch {
            persistenceError = "Не удалось прочитать сохранённые расходы: \(error.localizedDescription)"
        }
    }

    private func save() {
        do {
            let data = try JSONEncoder().encode(items)
            UserDefaults.standard.set(data, forKey: "expenses")
            persistenceError = nil
        } catch {
            persistenceError = "Не удалось сохранить расходы: \(error.localizedDescription)"
        }
    }
}
```

### AddExpenseView.swift

```swift
import SwiftUI
struct AddExpenseView: View {
    @State private var name = ""
    @State private var amount = 0.0
    let expenses: Expenses
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                TextField("Название", text: $name)
                TextField("Сумма", value: $amount, format: .number)
                    .keyboardType(.decimalPad)
            }
            .navigationTitle("Новый расход")
            .toolbar {
                Button("Сохранить") {
                    expenses.items.append(ExpenseItem(name: name, amount: amount))
                    dismiss()
                }
                .disabled(name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || amount <= 0)
            }
        }
    }
}
```

</details>

<ProjectRecap slug="project-07-iexpense" />

Дальше загрузим более сложные локальные данные в [Moonshot →](/projects/project-08-moonshot).
