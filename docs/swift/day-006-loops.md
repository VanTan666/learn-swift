---
title: День 6 — Циклы
description: for, while, ranges, вложенные циклы, break, continue и FizzBuzz.
---

<TheoryApplications concept="ranges" :limit="3" />

# День 6 — Циклы

Цикл повторяет действие. Вместо десяти одинаковых вызовов `print` мы описываем, что менять на каждой итерации.

## `for` с Array

```swift
let platforms = ["iOS", "macOS", "watchOS"]

for platform in platforms {
    print("Swift работает на \(platform)")
}
```

На каждой итерации `platform` получает следующий элемент. Имя существует только внутри фигурных скобок.

## Диапазоны `...` и `..<`

Закрытый диапазон `1...5` включает обе границы.

```swift
for number in 1...5 {
    print(number) // 1, 2, 3, 4, 5
}
```

Полуоткрытый диапазон `0..<5` не включает правую границу.

```swift
for index in 0..<5 {
    print(index) // 0, 1, 2, 3, 4
}
```

`..<` часто подходит индексам и повторению ровно `n` раз. Если само значение не нужно, используйте `_`.

```swift
for _ in 1...3 {
    print("Ещё раз")
}
```

## Вложенные циклы

Цикл может находиться внутри другого цикла.

```swift
for row in 1...3 {
    for column in 1...3 {
        print("Строка \(row), столбец \(column)")
    }
}
```

Внутренний цикл полностью выполняется для каждой итерации внешнего. Количество операций быстро растёт, поэтому следите за размерами коллекций.

## `while`

`while` повторяет код, пока условие истинно. Он удобен, когда заранее неизвестно число повторов.

```swift
var countdown = 3

while countdown > 0 {
    print(countdown)
    countdown -= 1
}

print("Старт!")
```

Убедитесь, что тело цикла когда-нибудь изменит условие. Иначе получится бесконечный цикл.

## `break`

`break` немедленно завершает ближайший цикл.

```swift
for number in 1...100 {
    if number == 7 {
        print("Найдено")
        break
    }
}
```

Для выхода из нескольких вложенных циклов можно дать внешнему циклу label.

```swift
outerLoop: for row in 1...10 {
    for column in 1...10 {
        if row * column == 42 {
            print("\(row) × \(column)")
            break outerLoop
        }
    }
}
```

## `continue`

`continue` пропускает остаток текущей итерации и переходит к следующей.

```swift
for number in 1...10 {
    if number.isMultiple(of: 2) {
        continue
    }
    print(number) // только нечётные
}
```

Метод `isMultiple(of:)` обычно яснее, чем сравнение остатка `number % 2 == 0`.

<Checkpoint>
<template #task>

Пройдите по числам от 1 до 100. Для кратных 3 печатайте `Fizz`, для кратных 5 — `Buzz`, для кратных и 3, и 5 — `FizzBuzz`. Для остальных печатайте само число.

</template>
<template #knowledge>

- закрытый диапазон `1...100`;
- `for`, `if` и `else if`;
- `isMultiple(of:)`;
- порядок проверок.

</template>
<template #hint>

Сначала проверяйте кратность сразу 15. Если начать с кратности 3, число 15 попадёт в первую ветку, и до `FizzBuzz` выполнение не дойдёт.

</template>
<template #solution>

```swift
for number in 1...100 {
    if number.isMultiple(of: 15) {
        print("FizzBuzz")
    } else if number.isMultiple(of: 3) {
        print("Fizz")
    } else if number.isMultiple(of: 5) {
        print("Buzz")
    } else {
        print(number)
    }
}
```

</template>
</Checkpoint>

::: tip Что запомнить
`for` проходит по последовательности. `while` повторяет действие по условию. `break` завершает цикл, `continue` пропускает одну итерацию.
:::

## Индексы, пары и шаг

```swift
for (index, name) in names.enumerated() {
    print("\(index + 1). \(name)")
}

for (name, score) in zip(names, scores) {
    print("\(name): \(score)")
}

for value in stride(from: 10, through: 0, by: -2) {
    print(value)
}
```

`enumerated()` безопаснее ручного индекса, `zip` идёт до конца более короткой sequence, а `stride` выражает нестандартный шаг. Асинхронные sequences используют `for await`; они разобраны в [Day 16](/swift/day-016-concurrency).
