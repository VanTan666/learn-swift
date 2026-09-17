---
title: День 8 — Функции, часть 2
description: Значения по умолчанию, throwing functions, do/try/catch и Checkpoint 4.
---

# День 8 — Функции, часть 2

Теперь сделаем функции удобнее для обычных случаев и научимся сообщать о невозможном результате без аварийного завершения программы.

## Значения параметров по умолчанию

Если большинство вызовов используют одно значение, задайте default.

```swift
func printTimesTable(number: Int, end: Int = 10) {
    for value in 1...end {
        print("\(value) × \(number) = \(value * number)")
    }
}

printTimesTable(number: 5)
printTimesTable(number: 5, end: 20)
```

Первый вызов использует `10`, второй явно заменяет его на `20`.

У стандартных API тоже есть default-параметры:

```swift
var names = ["Анна", "Борис"]
names.removeAll()                  // сохранять память не просим
names.removeAll(keepingCapacity: true)
```

## Когда обычного return недостаточно

Иногда функция не может вернуть нормальный результат: пароль слишком короткий, файл повреждён, число вне разрешённого диапазона. Ошибка должна объяснить вызывающему коду, что произошло.

Сначала объявим варианты ошибки:

```swift
enum PasswordError: Error {
    case tooShort
    case obvious
}
```

Функция с `throws` может выбросить один из этих вариантов.

```swift
func checkPassword(_ password: String) throws -> String {
    if password.count < 8 {
        throw PasswordError.tooShort
    }

    if password == "password" {
        throw PasswordError.obvious
    }

    return "Пароль подходит"
}
```

`throw` немедленно прекращает функцию, похожим образом на `return`, но передаёт ошибку.

## `do`, `try` и `catch`

Вызов throwing function помечается `try` и выполняется в `do`.

```swift
do {
    let result = try checkPassword("swift-coder")
    print(result)
} catch PasswordError.tooShort {
    print("Нужно минимум восемь символов")
} catch PasswordError.obvious {
    print("Пароль слишком очевиден")
} catch {
    print("Неизвестная ошибка: \(error.localizedDescription)")
}
```

Swift выбирает подходящий `catch`. Общий `catch` в конце страхует неизвестные ошибки.

::: warning Частая ошибка
`throws` не означает, что функция обязательно выбросит ошибку. Оно означает, что функция *может* это сделать, а вызывающий код обязан выбрать способ обработки.
:::

## `try?` и `try!`

`try?` превращает результат в optional: при ошибке получится `nil`.

```swift
let result = try? checkPassword("short")
```

Это удобно, когда причина ошибки не важна. `try!` аварийно завершает программу при ошибке и потому подходит только тогда, когда невозможность ошибки действительно доказана. В учебном и прикладном коде предпочитайте нормальную обработку.

::: details Глубже: typed throws в Swift 6

## Typed throws

Если функция может вернуть только один конкретный тип ошибки, Swift 6 позволяет записать его прямо в сигнатуре:

```swift
func checkPasswordTyped(_ password: String) throws(PasswordError) -> String {
    if password.count < 8 { throw .tooShort }
    if password == "password" { throw .obvious }
    return "Пароль подходит"
}
```

Обычный `throws` остаётся правильным выбором для большинства приложений, особенно когда функция объединяет системные API с разными ошибками. Typed throws полезен в небольших, строго ограниченных API.

:::

<Checkpoint>
<template #task>

Напишите функцию, которая принимает `Int` от 1 до 10 000 и возвращает его целый квадратный корень. Нельзя использовать `sqrt()`. Для числа вне диапазона выбрасывайте `outOfBounds`, а если целого корня нет — `noRoot`.

</template>
<template #knowledge>

- enum, соответствующий `Error`;
- throwing function;
- диапазон и цикл;
- `do`, `try`, `catch`.

</template>
<template #hint>

После проверки границ переберите кандидаты от 1 до 100. Если `candidate * candidate == number`, корень найден. Максимальный корень для 10 000 равен 100.

</template>
<template #solution>

```swift
enum SquareRootError: Error {
    case outOfBounds
    case noRoot
}

func integerSquareRoot(of number: Int) throws -> Int {
    if number < 1 || number > 10_000 {
        throw SquareRootError.outOfBounds
    }

    for candidate in 1...100 {
        if candidate * candidate == number {
            return candidate
        }
    }

    throw SquareRootError.noRoot
}

do {
    print(try integerSquareRoot(of: 144))
} catch SquareRootError.outOfBounds {
    print("Число вне диапазона")
} catch SquareRootError.noRoot {
    print("Целого корня нет")
}
```

</template>
</Checkpoint>

::: tip Что запомнить
Default-параметр упрощает частый вызов. `throws` сохраняет подробности сбоя и позволяет обработать их там, где есть контекст для решения.
:::
