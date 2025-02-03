import { extractClassesFromTemplate } from './extract-classes-from-template';

describe('extract-classes-from-template', () => {
    it('Should spot classes declared in html class attributes', () => {
        expect(
            extractClassesFromTemplate(`
            <div class="header main" [ngClass]="{ active: isActive}">
                <div [ngClass]="{ active: isActive, disabled: isDisabled }"></div>
                <div class="footer" [ngClass]="{'text-bold': isBold, 'text-italic': isItalic}"></div>
            </div>
        `)
        ).toEqual(['header', 'main', 'active', 'disabled', 'footer', 'text-bold', 'text-italic']);

        expect(
            extractClassesFromTemplate(`<div class="weather-widget">
  @if(weatherForecast$ | async; as weatherData) { @for (weather of
  weatherData;track $index ) {
  <div class="weather">
    <app-weather [weather]="weather"/>
  </div>
  } }</div>
  <data value=""></data>`)
        ).toEqual(['weather-widget', 'weather']);
    });
});
