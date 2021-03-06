import {CommonModule} from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';
import {LogProvider} from './log.service';


@NgModule({
  imports: [CommonModule],
  providers: [LogProvider]
})
export class LogFileAppenderModule {
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: LogFileAppenderModule,
      providers: [LogProvider]
    };
  }

  public static forChild(): ModuleWithProviders {
    return {
      ngModule: LogFileAppenderModule,
      providers: [LogProvider]
    };
  }
}
