<template>
  <section class="checkpoint challenge">
    <header><span aria-hidden="true">🏆</span><div><small>Самостоятельная работа</small><h2>Испытание</h2></div></header>
    <div class="checkpoint-section"><h3>Задание</h3><slot name="task" /></div>
    <div class="checkpoint-section"><h3>Что уже нужно знать</h3><slot name="knowledge" /></div>
    <details><summary>Показать подсказку 1</summary><div class="checkpoint-reveal"><slot name="hint1" /></div></details>
    <details><summary>Показать подсказку 2</summary><div class="checkpoint-reveal"><slot name="hint2" /></div></details>
    <details><summary>Показать решение</summary><div class="checkpoint-reveal"><slot name="solution" /></div></details>
  </section>
</template>
