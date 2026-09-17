---
title: Контрольная — Projects 10–12
description: Сеть, Codable и SwiftData в приложении друзей и интересов.
milestoneSlug: milestone-10-12
---

# Контрольная — Projects 10–12

Создай приложение, которое один раз загружает пользователей из JSON API, сохраняет их в SwiftData и показывает друзей каждого пользователя без повторной сети.

## Требования

1. `Codable` transport models для JSON;
2. SwiftData models `User` и `Friend` с relationship;
3. loading, error и content состояния;
4. сортируемый список пользователей;
5. detail screen с информацией и друзьями;
6. повторный запуск читает локальную базу.
7. HTTP status проверяется, запрос можно отменить и повторить;
8. повторный import идемпотентен и не создаёт дубликаты.

<Challenge>
<template #task>Построй import pipeline «download → decode → map → insert» и не смешивай его с layout-кодом.</template>
<template #knowledge>URLSession, async/await, Codable, SwiftData, relationships, predicates и navigation.</template>
<template #hint1>Раздели transport struct и persistent class: серверная schema не обязана быть schema базы.</template>
<template #hint2>Перед загрузкой проверь `fetchCount`; если записи уже есть, не выполняй запрос повторно.</template>
<template #solution>

```swift
let descriptor = FetchDescriptor<User>()
guard try context.fetchCount(descriptor) == 0 else { return }
let (data, response) = try await URLSession.shared.data(from: url)
guard let http = response as? HTTPURLResponse,
      200..<300 ~= http.statusCode else {
    throw URLError(.badServerResponse)
}
let remoteUsers = try JSONDecoder().decode([RemoteUser].self, from: data)
for remote in remoteUsers { context.insert(User(remote: remote)) }
try context.save()
```

</template>
</Challenge>

::: details Дополнительно: проверь migration
Если приложение уже меняло schema между версиями, создай копию старого store и проверь открытие после migration. Для нового учебного проекта это необязательная production-практика: основной milestone считается завершённым без старой базы и migration plan.
:::

После проверки начинается Advanced Topics: [Instafilter →](/projects/project-13-instafilter).
