---
title: День 19 — Observation и data flow
description: "@Observable, @State, @Bindable, Environment и правила владения состоянием в SwiftUI."
---

# День 19 — Observation и data flow

SwiftUI перерисовывает интерфейс, когда прочитанные им данные меняются. Observation framework из iOS 17 отслеживает доступ к properties точнее и требует меньше wrappers, чем старый `ObservableObject`.

## Модель с `@Observable`

```swift
import Observation

@Observable
final class Cart {
    var products: [String] = []
    var draftName = ""

    var isEmpty: Bool { products.isEmpty }

    func addDraft() {
        let name = draftName.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !name.isEmpty else { return }
        products.append(name)
        draftName = ""
    }
}
```

Macro `@Observable` генерирует observation-механику во время компиляции. Это не хранилище: сохранение данных проектируется отдельно.

## Кто владеет состоянием

View, который создаёт модель и определяет срок её жизни, хранит её в `@State`:

```swift
struct CartScreen: View {
    @State private var cart = Cart()

    var body: some View {
        CartEditor(cart: cart)
    }
}
```

`@State` сохраняет объект между обновлениями `body`. Не создавайте `Cart()` внутри `body`: при новой оценке View состояние может потеряться.

## Когда нужен `@Bindable`

Обычной property достаточно для чтения и вызова methods. `@Bindable` нужен, когда дочерний экран должен получить `Binding` к property observable-модели.

```swift
struct CartEditor: View {
    @Bindable var cart: Cart

    var body: some View {
        TextField("Товар", text: $cart.draftName)
        Button("Добавить", action: cart.addDraft)
    }
}
```

Если черновик относится только к одному экрану, его можно оставить локальным `@State`. Не каждое временное значение должно жить в shared model.

## Environment для зависимости

```swift
@main
struct ShopApp: App {
    @State private var cart = Cart()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(cart)
        }
    }
}

struct CartBadge: View {
    @Environment(Cart.self) private var cart

    var body: some View {
        Text("\(cart.products.count)")
    }
}
```

Environment подходит для настоящей shared dependency. Для локальной связи родителя с ребёнком явный параметр обычно проще.

## Старый и новый подход

`ObservableObject`, `@Published`, `@StateObject` и `@ObservedObject` нужны для targets ниже iOS 17 и существующих libraries. В новом iOS 17+ коде начинайте с `@Observable`, `@State` для владельца и `@Bindable` только для bindings.

::: details Глубже: изоляция интерфейса

## Изоляция интерфейса

UI state меняется на main actor. Network и CPU work могут выполняться вне UI, а готовый результат присваивается модели на main actor. Mutable observable class нельзя передавать между concurrent tasks как будто она автоматически `Sendable`.

:::

<Checkpoint>
<template #task>

Создайте `@Observable`-модель списка покупок, root View-владельца и editor с `@Bindable`. Добавьте computed property количества незавершённых пунктов и empty state.

</template>
<template #knowledge>

- ownership через `@State`;
- bindings через `@Bindable`;
- derived state вместо дублирующей stored property;
- `@Environment` только для shared dependency.

</template>
<template #hint>

Сначала сделайте модель независимой от SwiftUI. View должен читать `pendingCount`, а не вручную обновлять второй счётчик.

</template>
<template #solution>

Проверьте три сценария: пустой список, добавление элемента и отметка выполненным. После каждого действия `pendingCount` должен вычисляться из массива.

</template>
</Checkpoint>

### Официальные источники

- [Observation](https://developer.apple.com/documentation/observation)
- [Migrating from ObservableObject to Observable](https://developer.apple.com/documentation/swiftui/migrating-from-the-observable-object-protocol-to-the-observable-macro)
- [Managing user interface state](https://developer.apple.com/documentation/swiftui/managing-user-interface-state)
