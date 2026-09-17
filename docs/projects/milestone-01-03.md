---
title: Контрольная — Projects 1–3
description: Самостоятельный конвертер единиц после первых трёх проектов.
milestoneSlug: milestone-01-03
---

# Контрольная — Projects 1–3

Пора собрать небольшое приложение без пошагового копирования. Ты уже умеешь создавать форму, хранить state, строить элементы через `ForEach` и выносить оформление в reusable View.

## Задача: конвертер единиц

Создай приложение, которое переводит одно значение между единицами одной категории — например, температуру, длину, время или объём.

Требования:

1. `TextField` для исходного числа;
2. два `Picker`: исходная и конечная единица;
3. не меньше трёх единиц;
4. computed property с результатом;
5. понятное форматирование и `NavigationStack`.
6. enum для единиц вместо произвольных строк;
7. понятное состояние для пустого или некорректного ввода;
8. проверка VoiceOver и максимального Dynamic Type;
9. parameterized Swift Testing-тесты минимум трёх преобразований.

<Challenge>
<template #task>Спроектируй и собери конвертер. Сначала нарисуй список состояний и формулу, затем открывай Xcode.</template>
<template #knowledge>`@State`, Binding, `Form`, `Picker`, `ForEach`, computed properties и modifiers.</template>
<template #hint1>Удобно сначала привести исходное значение к общей базовой единице, а затем перевести в выбранную конечную.</template>
<template #hint2>Для температуры формулы нелинейны; для первого решения проще взять длину или время.</template>
<template #solution>

```swift
let units = ["Метры", "Километры", "Мили"]

var meters: Double {
    switch inputUnit {
    case "Километры": input * 1000
    case "Мили": input * 1609.344
    default: input
    }
}

var result: Double {
    switch outputUnit {
    case "Километры": meters / 1000
    case "Мили": meters / 1609.344
    default: meters
    }
}
```

</template>
</Challenge>

::: tip Критерий готовности
Проверь минимум три известных преобразования, ввод дробного числа и смену обеих единиц. После этого отметь milestone завершённым.
:::

Следующая группа начинается с [Project 4 — BetterRest →](/projects/project-04-betterrest).
