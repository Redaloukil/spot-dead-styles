# spot-dead-styles

In scenarios when component styles is created or modified, it is easy to let slip a class definition on the component template or styling definition. this can lead to remaining dead code that is very hard to spot without good eyes.
Letting styling dead code results into increasing time to maintain the styles and modifying it.

## Purpose

First versions of the code base are for proof of concept purposes. this is not a reliable tool to run a daily basis because it can lead to mistakes considering that few classes are not fully reliable.

## Scope

Practically this can be achived on many type of template-style use cases. the use case that I face on day to day is related to Angular framework projects, configured with a scss styling.
the conventional file structure of a component is :

```
<component_name>
|-<component_name>.component.html
|-<component_name>.component.ts
|-<component_name>.component.scss
```

## Stages of verification

1. Development ( using code editor extension), see section bellow
2. Pre-push checks.
3. Code sanity check ( automation on PR reviews).

## Vscode extension

to be registered.
