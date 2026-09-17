---
title: Версии и совместимость курса
description: Единая version policy для Swift, Xcode, SDK и deployment target.
---

# Версии и совместимость курса

Эта страница — единственный источник version policy. Дата проверки: **17 сентября 2026 года**.

## Базовая среда

- стабильный Swift: **6.4**;
- стабильный Xcode: **27**;
- SDK для новых сборок: **iOS 27**;
- базовый deployment target учебных SwiftUI-проектов: **iOS 17**.

Чистые Swift-статьи не зависят от deployment target. В конкретном проекте минимальная версия указывается только тогда, когда показанный API новее iOS 17 или выбор версии меняет решение.

## Как читать версии

- **Swift version** определяет возможности языка и диагностику компилятора;
- **Xcode version** определяет набор инструментов и включённый compiler;
- **SDK** определяет API, с которыми приложение можно собрать;
- **deployment target** определяет самую старую iOS, на которой приложение должно запуститься.

Новый SDK не требует автоматически поднимать deployment target. Для нового API используйте availability check и совместимый fallback:

```swift
if #available(iOS 27, *) {
    NewFeatureView()
} else {
    CompatibleFeatureView()
}
```

## Правила курса

1. Основной маршрут использует стабильные инструменты, не beta.
2. Beginner-пример сначала показывает самое простое корректное решение.
3. API новее baseline помещаются в блок «Глубже» или «Advanced».
4. Если Xcode показывает другую диагностику, сначала сравните language mode и настройки actor isolation.
5. Перед публикацией приложения отдельно проверьте требования App Store и актуальные release notes.

### Официальные источники

- [Swift 6.4 Released](https://www.swift.org/blog/swift-6.4-released/)
- [Xcode system requirements](https://developer.apple.com/xcode/system-requirements/)
- [Apple Developer releases](https://developer.apple.com/news/releases/)

