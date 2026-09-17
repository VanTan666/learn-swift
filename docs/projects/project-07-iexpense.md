---
title: Project 7 — iExpense
description: Трекер расходов с observation, sheet, Codable и UserDefaults.
projectSlug: project-07-iexpense
---

# Project 7 — iExpense

iExpense хранит личные и рабочие расходы, добавляет записи на отдельном экране и сохраняет их между запусками. Проект вводит shared reference state и persistence.

<ProjectPrerequisites slug="project-07-iexpense" />

## Рабочий vertical slice

```swift
import SwiftUI
import Observation

struct ExpenseItem: Identifiable, Codable {
    var id = UUID()
    let name: String
    let amount: Double
}

@Observable
final class Expenses {
    var items: [ExpenseItem] = [] { didSet { save() } }

    init() {
        guard let data = UserDefaults.standard.data(forKey: "expenses"),
              let saved = try? JSONDecoder().decode([ExpenseItem].self, from: data) else { return }
        items = saved
    }

    private func save() {
        guard let data = try? JSONEncoder().encode(items) else { return }
        UserDefaults.standard.set(data, forKey: "expenses")
    }
}

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
            .toolbar { Button("Добавить", systemImage: "plus") { showingAdd = true } }
            .sheet(isPresented: $showingAdd) { AddExpenseView(expenses: expenses) }
        }
    }
}

struct AddExpenseView: View {
    @Environment(\.dismiss) private var dismiss
    let expenses: Expenses
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
            .toolbar {
                Button("Сохранить") {
                    expenses.items.append(ExpenseItem(name: name, amount: amount))
                    dismiss()
                }
                .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty || amount <= 0)
            }
        }
    }
}
```

Главная концепция — один `Expenses`, созданный владельцем через `@State` и переданный editor обычным параметром. Сначала проверьте add/delete и перезапуск, затем добавляйте категории.

## Модель расхода

```swift
struct ExpenseItem: Identifiable, Codable {
    var id = UUID()
    let name: String
    let type: String
    let amount: Double
}
```

Это знакомый struct, который соответствует двум protocols. `Identifiable` даёт стабильный `id` для `List`, а `Codable` позволяет кодировать значение в данные.

## Общий observable state

```swift
@Observable
final class Expenses {
    var items = [ExpenseItem]()
}
```

Class выбирается осмысленно: нескольким View нужен один объект с общей идентичностью. `@Observable` сообщает SwiftUI, какие reads зависят от его properties.

View-владелец создаёт модель через `@State private var expenses = Expenses()`. Дочернему экрану передаётся обычная `var expenses: Expenses`; `@Bindable` нужен только там, где требуется `$expenses.someProperty`. Это сохраняет один источник истины и ясный срок жизни модели.

## Sheet и dismiss

```swift
.sheet(isPresented: $showingAddExpense) {
    AddView(expenses: expenses)
}
```

Sheet показывает временный экран поверх текущего. В дочернем View `@Environment(\.dismiss)` получает системное действие закрытия — его не нужно передавать вручную через каждый уровень.

## Сохранение

```swift
if let encoded = try? JSONEncoder().encode(items) {
    UserDefaults.standard.set(encoded, forKey: "Items")
}
```

`try?` из Day 14 превращает ошибку в Optional, но здесь он скрывает причину сбоя. В улучшенной версии загрузите данные в initializer модели через `do/catch`, сохраните понятный `persistenceError` и покажите его на экране. `UserDefaults` подходит для небольшого учебного массива; связанные и растущие данные лучше перенести в SwiftData.

## Удаление из List

```swift
.onDelete(perform: removeItems)

func removeItems(at offsets: IndexSet) {
    expenses.items.remove(atOffsets: offsets)
}
```

Modifier передаёт function как значение — это знакомая идея closures/functions.

<Challenge>
<template #task>Покажи личные и рабочие расходы отдельными sections, добавь валютное форматирование и цвет для крупных сумм.</template>
<template #knowledge>Array filtering, conditions, computed properties, `List` и modifiers.</template>
<template #hint1>Создай computed properties `personalItems` и `businessItems`.</template>
<template #hint2>Не храни отфильтрованные Arrays отдельно: вычисляй их из одного источника данных.</template>
<template #solution>

```swift
var personalItems: [ExpenseItem] { items.filter { $0.type == "Personal" } }
var businessItems: [ExpenseItem] { items.filter { $0.type == "Business" } }
```

</template>
</Challenge>

<ProjectRecap slug="project-07-iexpense" />

Дальше загрузим более сложные локальные данные в [Moonshot →](/projects/project-08-moonshot).
