---
title: День 11 — Структуры, часть 2
description: Access control, private(set), static properties и Checkpoint 6.
---

# День 11 — Структуры, часть 2

Хороший тип не просто хранит данные — он защищает собственные правила. Access control ограничивает места, где можно читать или менять отдельные детали.

## Зачем скрывать данные

Представим банковский счёт. Если `funds` доступен для записи отовсюду, любой код может создать отрицательный баланс без проверки.

```swift
struct BankAccount {
    private var funds = 0

    mutating func deposit(amount: Int) {
        guard amount > 0 else { return }
        funds += amount
    }

    mutating func withdraw(amount: Int) -> Bool {
        guard amount > 0, amount <= funds else { return false }
        funds -= amount
        return true
    }

    func printBalance() {
        print("Баланс: \(funds)")
    }
}
```

`private` разрешает доступ только внутри типа (и его расширений в том же файле). Внешний код использует методы, где правила проверены в одном месте.

## `private(set)`

Иногда значение полезно читать снаружи, но изменять только внутри типа.

```swift
struct BankAccount {
    private(set) var funds = 0

    mutating func deposit(amount: Int) {
        if amount > 0 {
            funds += amount
        }
    }
}

var account = BankAccount()
account.deposit(amount: 500)
print(account.funds)
// account.funds = -1 // Ошибка
```

Это удобный способ предоставить read-only интерфейс без отдельного computed property.

## Уровни доступа

На начальном этапе чаще всего встречаются:

- `private` — доступ внутри объявления;
- `fileprivate` — доступ в текущем файле;
- `internal` — значение по умолчанию, доступ внутри модуля;
- `public` — доступ из других модулей;
- `open` — для classes, разрешает наследование и override за пределами модуля.

Для приложения обычно достаточно `private` и стандартного `internal`. `public` важнее при создании библиотек.

## Static properties и methods

Обычная property принадлежит экземпляру. `static` принадлежит самому типу и существует в одном общем экземпляре.

```swift
struct AppData {
    static let version = "1.0"
    static var launchCount = 0
}

AppData.launchCount += 1
print(AppData.version)
```

Создавать `AppData()` не нужно. `static` подходит для общих констант, фабричных примеров и счётчиков уровня типа.

## Фабричные примеры

```swift
struct Employee {
    let name: String
    let role: String

    static let example = Employee(
        name: "Анна",
        role: "iOS developer"
    )
}

print(Employee.example.name)
```

Такой sample удобен для previews и тестовых экранов: одно понятное значение вместо случайных данных по всему проекту.

## `self` и `Self`

`self` указывает на текущий экземпляр, а `Self` — на текущий тип.

```swift
struct User {
    let name: String

    static func anonymous() -> Self {
        Self(name: "Гость")
    }
}
```

`Self` особенно полезен в protocols и наследовании, потому что сохраняет конкретный тип вызывающего кода.

<Checkpoint>
<template #task>

Создайте `struct Car`, который хранит модель, количество мест и текущую передачу. Добавьте methods для переключения передачи вверх и вниз. Передача должна оставаться в диапазоне от 1 до 10, а внешний код не должен менять её напрямую.

</template>
<template #knowledge>

- stored properties;
- `private(set)`;
- mutating methods;
- проверка границ.

</template>
<template #hint>

Для внешнего чтения и внутренней записи объявите `private(set) var gear`. В methods проверяйте границу до изменения.

</template>
<template #solution>

```swift
struct Car {
    let model: String
    let seats: Int
    private(set) var gear = 1

    mutating func shiftUp() {
        if gear < 10 {
            gear += 1
        }
    }

    mutating func shiftDown() {
        if gear > 1 {
            gear -= 1
        }
    }
}

var car = Car(model: "Hatchback", seats: 5)
car.shiftUp()
print(car.gear) // 2
```

</template>
</Checkpoint>

::: warning Частая ошибка
Access control не заменяет хороший интерфейс типа. Если вы скрыли property, предоставьте понятные операции, с помощью которых внешний код сможет выполнить допустимые изменения.
:::

::: details Глубже: `package` и инварианты

## `package` и инварианты

Swift 5.9 добавил access level `package`: символ доступен внутри всего Swift Package, но скрыт от его клиентов. Он полезен между targets одного package; для обычного app target чаще достаточно `internal`.

Access control помогает защищать invariant — условие, которое всегда истинно для корректного значения. Failable initializer не создаёт недопустимый экземпляр:

```swift
struct Percentage {
    private(set) var value: Int

    init?(_ value: Int) {
        guard 0...100 ~= value else { return nil }
        self.value = value
    }
}
```

Глобальное изменяемое `static var` в concurrent-коде требует actor isolation; подробности — в [Actors и Sendable](/swift/day-020-actors-and-sendable).

:::
