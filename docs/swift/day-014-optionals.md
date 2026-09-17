---
title: День 14 — Optionals
description: nil, if let, guard let, nil coalescing, optional chaining и try?.
---

<TheoryApplications concept="optionals" :limit="3" />

# День 14 — Optionals

**Optional (опциональное значение)** отвечает на вопрос: «значение есть или его нет?». Это не специальное пустое число и не строка. Optional хранит либо значение конкретного типа, либо `nil`.

## Создание optional

```swift
var username: String? = "Анна"
username = nil
```

`String?` и `String` — разные типы. Перед использованием optional нужно безопасно извлечь значение, потому что его может не быть.

```swift
let number = Int("42")  // Int?
let invalid = Int("Swift") // nil
```

Преобразование строки возвращает optional: не любая строка является числом.

## `if let`

Optional binding временно извлекает значение, если оно существует.

```swift
let name: String? = "Лена"

if let name = name {
    print("Привет, \(name)")
} else {
    print("Имя не указано")
}
```

В современном Swift при одинаковом имени запись сокращается:

```swift
if let name {
    print(name.uppercased())
}
```

Можно извлечь несколько значений и добавить условие.

```swift
let email: String? = "mail@example.com"
let age: Int? = 20

if let email, let age, age >= 18 {
    print("\(email): доступ разрешён")
}
```

## `guard let`

`guard let` проверяет обязательное условие и требует выйти из текущей области, если оно не выполнено.

```swift
func greet(_ name: String?) {
    guard let name else {
        print("Имя отсутствует")
        return
    }

    print("Привет, \(name)!")
}
```

После `guard` извлечённое значение доступно до конца функции. Это помогает обработать ошибки в начале и оставить основной путь без лишней вложенности.

## Nil coalescing

Оператор `??` подставляет запасное значение, если optional равен `nil`.

```swift
let savedName: String? = nil
let displayName = savedName ?? "Гость"
```

Правый операнд должен иметь тот же базовый тип: для `String?` запасное значение — `String`.

```swift
let input = "не число"
let value = Int(input) ?? 0
```

Используйте fallback, только когда он имеет честный смысл. Иногда `0` скрывает ошибочный ввод, и лучше показать сообщение.

## Optional chaining

`?.` вызывает property или method, только если значение существует.

```swift
let names = ["Анна", "Борис"]
let firstLetter = names.first?.uppercased()
```

Если Array пуст, вся цепочка вернёт `nil`. Можно сразу добавить fallback.

```swift
let result = names.first?.uppercased() ?? "НЕТ ИМЕНИ"
```

Цепочка может быть длиннее:

```swift
struct Address {
    let city: String
}

struct User {
    let address: Address?
}

let user: User? = User(address: Address(city: "Казань"))
let city = user?.address?.city ?? "Город не указан"
```

## `try?`

`try?` превращает результат throwing function в optional. Успех даёт значение, ошибка — `nil`.

```swift
enum LoadError: Error { case missing }

func loadName() throws -> String {
    throw LoadError.missing
}

let loadedName = try? loadName()
```

Используйте `try?`, когда важен только факт успеха. Если нужно объяснить причину пользователю, выберите `do/catch`.

## Force unwrap: `!`

`value!` извлекает optional без проверки и аварийно завершает программу при `nil`.

```swift
let number = Int("42")!
```

В этом литеральном примере значение очевидно, но привычка к `!` опасна. В реальном вводе, сети и файлах данные меняются. Предпочитайте `if let`, `guard let` или `??`.

## Optional как enum

Упрощённо `String?` можно представить так:

```swift
enum OptionalString {
    case none
    case some(String)
}
```

Это помогает понять, почему значение нельзя использовать до извлечения: оно находится внутри одного из вариантов enum.

<Checkpoint>
<template #task>

Напишите функцию, которая принимает optional Array целых чисел и возвращает случайный элемент. Если Array отсутствует или пуст, верните случайное число от 1 до 100. Попробуйте выразить результат одной строкой.

</template>
<template #knowledge>

- optional parameter;
- optional chaining;
- `randomElement()` возвращает optional;
- nil coalescing `??`.

</template>
<template #hint>

Цепочка `numbers?.randomElement()` даст `nil`, если нет Array или в нём нет элементов. После неё можно поставить `??`.

</template>
<template #solution>

```swift
func randomNumber(from numbers: [Int]?) -> Int {
    numbers?.randomElement() ?? Int.random(in: 1...100)
}

print(randomNumber(from: [10, 20, 30]))
print(randomNumber(from: nil))
```

</template>
</Checkpoint>

::: tip Что запомнить
Optional заставляет явно обработать отсутствие данных. Это не помеха, а защита от целого класса ошибок с null references.
:::

## `map`, `flatMap` и два уровня отсутствия

Optional `map` преобразует wrapped value, не раскрывая его вручную:

```swift
let nickname: String? = "swiftie"
let label: String? = nickname.map { "@\($0)" }
```

Если closure сама возвращает Optional, `flatMap` не создаёт вложенный `T??`. Но обычный `if let` лучше, когда есть несколько шагов или отдельная ветка ошибки.

`T??` иногда несёт реальный смысл: внешнее `nil` может означать «запись не найдена», а внутреннее — «запись есть, поле не заполнено». Не сворачивайте эти состояния в одно, если интерфейс должен различать их.
