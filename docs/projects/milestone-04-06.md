---
title: Контрольная — Projects 4–6
description: Самостоятельная игра с таблицей умножения и анимациями.
milestoneSlug: milestone-04-06
---

# Контрольная — Projects 4–6

Ты научился работать с формами, вводом, списками, functions и animation. Теперь собери игру для тренировки таблицы умножения.

## Требования

- пользователь выбирает таблицы, например от `2` до `12`;
- выбирает длину раунда: 5, 10 или 20 вопросов;
- получает случайные примеры и вводит ответ;
- видит текущий счёт и номер вопроса;
- после раунда может начать заново;
- хотя бы одно изменение сопровождается осмысленной animation.
- состояния setup, playing и finished описаны enum;
- Reduce Motion отключает крупные перемещения, сохраняя понятную обратную связь;
- generation и scoring проверяются тестами отдельно от View.

<Challenge>
<template #task>Собери игру целиком. Не начинай с дизайна: сначала опиши state и функции `startGame`, `checkAnswer`, `nextQuestion`.</template>
<template #knowledge>Ranges, Arrays, random values, `TextField`, conditions, functions и animation.</template>
<template #hint1>Создай Array возможных множителей через Range, затем выбирай `randomElement()`.</template>
<template #hint2>Раздели состояния настройки и игры enum-значением или простым Bool.</template>
<template #solution>

```swift
func nextQuestion() {
    left = Int.random(in: 2...selectedTable)
    right = Int.random(in: 2...12)
    answer = ""
}

func checkAnswer() {
    if Int(answer) == left * right { score += 1 }
    questionNumber += 1
}
```

</template>
</Challenge>

Когда игра выдерживает полный раунд без сбоя, переходи к приложениям с несколькими экранами: [iExpense →](/projects/project-07-iexpense).
