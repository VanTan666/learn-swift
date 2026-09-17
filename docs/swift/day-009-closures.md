---
title: День 9 — Замыкания
description: Closure syntax, функции как значения, sorted/filter/map и trailing closures.
---

<TheoryApplications concept="closures" :limit="3" />

# День 9 — Замыкания

**Closure (замыкание)** — функция, которую можно сохранить в переменную или передать как значение. В SwiftUI замыкания встречаются повсюду: внутри `Button`, при построении списка и при обработке событий.

## Функция в переменной

Обычную функцию можно сохранить без вызова — без круглых скобок.

```swift
func greetUser() {
    print("Привет!")
}

let action = greetUser
action()
```

Тип `action` — `() -> Void`: она не принимает параметров и ничего не возвращает.

## Closure expression

Ту же функцию можно записать прямо в фигурных скобках.

```swift
let greetUser = {
    print("Привет!")
}

greetUser()
```

Параметры и return type находятся внутри скобок перед словом `in`.

```swift
let greet = { (name: String) -> String in
    "Привет, \(name)!"
}

print(greet("Лена"))
```

`in` отделяет описание входа и выхода от тела замыкания.

## Передача closure в функцию

Функция может принять поведение как параметр.

```swift
func perform(_ action: () -> Void) {
    print("Начало")
    action()
    print("Конец")
}

perform({
    print("Работа выполняется")
})
```

Тип `() -> Void` означает «замыкание без параметров и результата».

## Сортировка с `sorted(by:)`

Array знает, как сортировать стандартные типы по возрастанию. Замыкание позволяет задать другое правило.

```swift
let team = ["Мария", "Анна", "Александр", "Илья"]

let captainFirst = team.sorted { first, second in
    if first == "Анна" {
        return true
    } else if second == "Анна" {
        return false
    }

    return first < second
}
```

Замыкание получает два элемента и возвращает `true`, если первый должен стоять раньше второго.

## Сокращённые имена параметров

Swift умеет вывести типы и предлагает `$0`, `$1` для параметров.

```swift
let reverse = team.sorted { $0 > $1 }
```

Короткая форма хороша для одного ясного выражения. В сложной логике имена `first` и `second` читаются лучше.

## Trailing closures

Если последний параметр функции — closure, его можно вынести после скобок. Это называется trailing closure syntax.

```swift
func makeAnimation(duration: Double, changes: () -> Void) {
    print("Анимация: \(duration) сек.")
    changes()
}

makeAnimation(duration: 0.3) {
    print("Меняем интерфейс")
}
```

Именно поэтому SwiftUI-код выглядит как вложенная структура:

```swift
// Пример формы API SwiftUI:
// Button("Сохранить") {
//     saveDocument()
// }
```

## `filter` и `map`

`filter` оставляет элементы, для которых closure вернул `true`.

```swift
let numbers = [1, 2, 3, 4, 5, 6]
let even = numbers.filter { $0.isMultiple(of: 2) }
```

`map` преобразует каждый элемент и возвращает новый Array.

```swift
let labels = numbers.map { "Число: \($0)" }
```

Исходный массив при этом не меняется.

## Несколько closure-параметров

Современный Swift позволяет подписать несколько trailing closures.

```swift
func loadData(success: (String) -> Void, failure: () -> Void) {
    let loaded = true
    if loaded {
        success("Готово")
    } else {
        failure()
    }
}

loadData { message in
    print(message)
} failure: {
    print("Ошибка загрузки")
}
```

::: details Глубже: `@Sendable`

## `@Sendable` и конкурентный код

Closure, который может выполняться параллельно с другим кодом, часто помечается `@Sendable`. Компилятор Swift 6 проверяет, что такой closure не захватил небезопасное изменяемое состояние.

```swift
let makeMessage: @Sendable (String) -> String = { name in
    "Готово, \(name)"
}
```

Пока достаточно узнавать эту аннотацию. После первого async/await-проекта тема продолжится в [Actors и Sendable](/swift/day-020-actors-and-sendable).

:::

<Checkpoint>
<template #task>

Есть массив `let luckyNumbers = [7, 4, 38, 21, 16, 15, 12, 33, 31, 49]`. Одной цепочкой отфильтруйте чётные числа, отсортируйте оставшиеся по возрастанию, преобразуйте их в строки вида `7 — счастливое число`, затем напечатайте каждую строку.

</template>
<template #knowledge>

- `filter`, `sorted`, `map`;
- сокращённые параметры `$0`;
- цепочка преобразований;
- `for` для вывода.

</template>
<template #hint>

Каждый метод возвращает новый Array, поэтому после закрывающей скобки можно сразу вызвать следующий метод.

</template>
<template #solution>

```swift
let luckyNumbers = [7, 4, 38, 21, 16, 15, 12, 33, 31, 49]

let messages = luckyNumbers
    .filter { !$0.isMultiple(of: 2) }
    .sorted()
    .map { "\($0) — счастливое число" }

for message in messages {
    print(message)
}
```

</template>
</Checkpoint>

::: tip Что запомнить
Closure — обычное значение с функциональным типом. Сокращайте синтаксис только пока смысл остаётся очевидным.
:::
