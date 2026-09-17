---
title: Контрольная — Projects 7–9
description: Самостоятельный habit tracker с observation и persistence.
milestoneSlug: milestone-07-09
---

# Контрольная — Projects 7–9

Собери habit tracker: список привычек, detail screen и счётчик выполнений. Это проверяет model design, navigation и сохранение данных.

## Требования

- модель привычки с `id`, названием, описанием и числом выполнений;
- observable container с Array;
- sheet для добавления;
- NavigationLink к detail screen;
- кнопка увеличения счётчика;
- `Codable` + `UserDefaults` или локальный файл;
- удаление привычек.
- owner создаёт observable model через `@State`, editor использует `@Bindable` только для bindings;
- ошибка чтения или записи показывается, а не превращается в пустой список;
- add, complete, delete и повторная загрузка покрыты Swift Testing;
- navigation использует стабильный `id`, а не индекс Array.

<Challenge>
<template #task>Спроектируй data flow так, чтобы все экраны изменяли один источник данных и результат сохранялся после перезапуска.</template>
<template #knowledge>Struct vs class, `@Observable`, Binding, Codable, sheets и navigation.</template>
<template #hint1>Храни `[Habit]` в одном observable class, а в detail screen передавай идентификатор.</template>
<template #hint2>После изменения найди индекс через `firstIndex(where:)` и обнови элемент в исходном Array.</template>
<template #solution>

```swift
func complete(_ id: UUID) {
    guard let index = habits.firstIndex(where: { $0.id == id }) else { return }
    habits[index].count += 1
    save()
}
```

</template>
</Challenge>

После проверки переходи к network data в [Cupcake Corner →](/projects/project-10-cupcake-corner).
