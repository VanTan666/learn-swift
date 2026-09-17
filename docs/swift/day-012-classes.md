---
title: День 12 — Классы
description: Classes против structs, inheritance, initializers, deinitializers и reference semantics.
---

# День 12 — Классы

`class` похож на `struct`: у него есть properties, methods, access control и initializers. Главная разница — class является reference type. Несколько переменных могут указывать на один экземпляр.

## Объявление class

```swift
class Game {
    var score = 0

    func add(points: Int) {
        score += points
    }
}

let game = Game()
game.add(points: 10)
print(game.score)
```

Обратите внимание: `game` объявлен через `let`, но его изменяемая property меняется. Константа защищает саму ссылку от замены, а не состояние объекта.

## Memberwise initializer не создаётся

В отличие от struct, class не получает автоматический initializer для всех properties.

```swift
class Employee {
    let hours: Int

    init(hours: Int) {
        self.hours = hours
    }
}
```

Если у всех properties есть default values, можно обойтись стандартным `init()`.

## Inheritance

Class может наследовать properties и methods другого class.

```swift
class Employee {
    let hours: Int

    init(hours: Int) {
        self.hours = hours
    }

    func printSummary() {
        print("Работаю \(hours) часов")
    }
}

class Developer: Employee {
    func writeCode() {
        print("Пишу Swift")
    }
}
```

`Developer` получает `hours` и `printSummary()`.

## Override methods

Подкласс может заменить поведение method с помощью `override`.

```swift
class Manager: Employee {
    override func printSummary() {
        print("Руковожу командой в течение \(hours) часов")
    }
}
```

Если class не должен иметь подклассов, пометьте его `final`. Это также позволяет компилятору лучше оптимизировать вызовы.

## Initializer подкласса

Сначала подкласс инициализирует собственные properties, затем вызывает `super.init`.

```swift
class Developer: Employee {
    let language: String

    init(hours: Int, language: String) {
        self.language = language
        super.init(hours: hours)
    }
}
```

`super` обращается к реализации родительского class.

## Reference semantics

При присваивании class не копируется: обе переменные указывают на один объект.

```swift
class User {
    var name: String

    init(name: String) {
        self.name = name
    }
}

let first = User(name: "Анна")
let second = first
second.name = "Борис"

print(first.name) // Борис
```

С struct результат был бы другим: изменилась бы только копия. Совместное состояние бывает нужно, но за ним сложнее следить.

Чтобы создать независимый class-экземпляр, напишите явный метод копирования.

```swift
func copy() -> User {
    User(name: name)
}
```

## Deinitializer

`deinit` вызывается, когда последний владелец class-экземпляра исчезает.

```swift
class Session {
    let id: Int

    init(id: Int) {
        self.id = id
        print("Сессия \(id) началась")
    }

    deinit {
        print("Сессия \(id) завершилась")
    }
}
```

Deinitializer не принимает параметров и не вызывается вручную. Он нужен для освобождения ресурсов, но обычную бизнес-логику лучше завершать явно.

## Когда class, а когда struct

Начинайте со struct. Выбирайте class, когда нужна идентичность одного совместно используемого объекта, наследование, deinitializer или интеграция с class-based API.

| Возможность | struct | class |
| --- | --- | --- |
| Семантика | Копирование значения | Общая ссылка |
| Наследование | Нет | Да |
| Авто memberwise init | Да | Нет |
| Изменение через `let` | Нет | Изменяемые properties — да |
| `deinit` | Нет | Да |

<Checkpoint>
<template #task>

Создайте class hierarchy животных: базовый `Animal` с количеством лап, subclasses `Dog` и `Cat`, затем конкретные породы. У собак должен быть method `speak()`, у кошек — `speak()` и property `isTame`. Переопределите звук у конкретных пород.

</template>
<template #knowledge>

- inheritance и `override`;
- initializers и `super.init`;
- общие и специализированные properties.

</template>
<template #hint>

Храните `legs` в `Animal`. В `Cat` добавьте `isTame` и собственный initializer, который сначала задаёт эту property, затем вызывает `super.init(legs: 4)`.

</template>
<template #solution>

```swift
class Animal {
    let legs: Int

    init(legs: Int) {
        self.legs = legs
    }
}

class Dog: Animal {
    init() { super.init(legs: 4) }
    func speak() { print("Гав!") }
}

class Corgi: Dog {
    override func speak() { print("Тяв!") }
}

class Cat: Animal {
    let isTame: Bool

    init(isTame: Bool) {
        self.isTame = isTame
        super.init(legs: 4)
    }

    func speak() { print("Мяу!") }
}

class Lion: Cat {
    init() { super.init(isTame: false) }
    override func speak() { print("Р-р-р!") }
}
```

</template>
</Checkpoint>

## ARC и циклы сильных ссылок

ARC освобождает class instance, когда на него больше нет strong references. Две сильные ссылки друг на друга создают цикл. Ссылка владельца на временного наблюдателя обычно должна быть `weak`:

```swift
protocol PlayerDelegate: AnyObject {}

final class Player {
    weak var delegate: (any PlayerDelegate)?
}
```

`weak` всегда optional и автоматически становится `nil`. `unowned` не optional, но аварийно завершит программу, если объект уже уничтожен, поэтому требует доказанного общего срока жизни. Объявляйте class как `final`, если наследование не является частью модели. Mutable class также нельзя бездумно передавать между concurrent tasks — используйте actor isolation.
