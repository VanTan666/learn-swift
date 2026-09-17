---
title: День 7 — Функции, часть 1
description: Параметры, return values, tuples и parameter labels.
---

# День 7 — Функции, часть 1

Функция объединяет несколько действий под понятным именем. Это уменьшает повторение и позволяет обсуждать намерение: `calculateTotal()` яснее, чем набор арифметических строк в каждом месте.

## Объявление и вызов

```swift
func showWelcome() {
    print("Добро пожаловать!")
    print("Начинаем изучать Swift")
}

showWelcome()
```

Объявление само по себе не выполняет код. Работа начинается при вызове со скобками.

## Параметры

Параметр принимает значение при вызове. Его тип указывается явно.

```swift
func printTimesTable(number: Int) {
    for value in 1...10 {
        print("\(value) × \(number) = \(value * number)")
    }
}

printTimesTable(number: 5)
```

Можно передать несколько параметров:

```swift
func printTimesTable(number: Int, end: Int) {
    for value in 1...end {
        print("\(value) × \(number) = \(value * number)")
    }
}

printTimesTable(number: 7, end: 12)
```

Swift проверяет типы и labels аргументов, поэтому вызов трудно перепутать.

## Return values

Функция может вернуть значение. После `->` записывается тип результата.

```swift
func rollDice() -> Int {
    Int.random(in: 1...6)
}

let result = rollDice()
print(result)
```

У функции из одного выражения `return` можно опустить. В более длинной функции явный `return` обычно улучшает чтение.

```swift
func areLettersIdentical(first: String, second: String) -> Bool {
    let firstSorted = first.sorted()
    let secondSorted = second.sorted()
    return firstSorted == secondSorted
}
```

## Ранний `return`

`return` немедленно завершает функцию. Это удобно для проверки недопустимого ввода.

```swift
func greet(name: String) {
    if name.isEmpty {
        print("Имя не указано")
        return
    }

    print("Привет, \(name)!")
}
```

## Возвращение нескольких значений: tuple

**Tuple (кортеж)** группирует фиксированное количество значений, возможно разных типов.

```swift
func getUser() -> (name: String, age: Int, isAdmin: Bool) {
    (name: "Лена", age: 24, isAdmin: false)
}

let user = getUser()
print(user.name)
print(user.age)
```

Можно сразу разобрать tuple на отдельные константы.

```swift
let (name, age, _) = getUser()
print("\(name), \(age)")
```

`_` означает, что третье значение нам не нужно. Tuple хорош для небольшого локального результата. Если набор данных имеет самостоятельный смысл и используется широко, позже лучше создать `struct`.

## Parameter labels

У каждого параметра есть label для места вызова и имя внутри функции. По умолчанию они совпадают.

```swift
func send(message: String, to recipient: String) {
    print("Отправляем «\(message)» для \(recipient)")
}

send(message: "Привет", to: "Анна")
```

Снаружи читается `to:`, внутри используется точное имя `recipient`.

Label можно убрать с помощью `_`:

```swift
func isUppercase(_ text: String) -> Bool {
    text == text.uppercased()
}

print(isUppercase("SWIFT"))
```

Убирайте label, только когда вызов остаётся естественным. `isUppercase("SWIFT")` читается хорошо; два безымянных числа часто уже неоднозначны.

::: info Обрати внимание
Имена функций обычно начинаются с глагола: `loadProfile`, `calculateTotal`, `showError`. Название должно объяснять результат или действие.
:::

## Область видимости

Параметры и локальные переменные существуют только внутри функции. Это уменьшает количество состояний, за которыми нужно следить.

```swift
func square(_ number: Int) -> Int {
    let result = number * number
    return result
}

// print(result) // result здесь не существует
```

<Checkpoint>
<template #task>

Напишите `summarize(_:)`, которая принимает массив оценок и возвращает tuple с минимумом, максимумом и средним значением. Для пустого массива верните `nil`.

</template>
<template #knowledge>

- parameters и return value;
- optional result;
- tuple с именованными полями;
- ранний `return`.

</template>
<template #hint>

Сначала проверьте `scores.isEmpty`. Значения `min()` и `max()` сами возвращают optional, но после этой проверки массив точно не пуст.

</template>
<template #solution>

```swift
func summarize(_ scores: [Double]) -> (min: Double, max: Double, average: Double)? {
    guard let minimum = scores.min(), let maximum = scores.max() else {
        return nil
    }

    let average = scores.reduce(0, +) / Double(scores.count)
    return (minimum, maximum, average)
}

if let result = summarize([7.5, 9, 8.5]) {
    print(result.average)
}
```

</template>
</Checkpoint>
