import { Component, OnInit } from '@angular/core';
import {ToastService} from '../../../services/toast/toast.service';
import {Entry} from '@ionic-native/file';
import {File} from '@ionic-native/file/ngx';
import {LogProvider} from '../../../services/logging/log.service';

@Component({
  selector: 'app-dev-logging',
  templateUrl: './dev-logging.component.html',
  styleUrls: ['./dev-logging.component.scss'],
})
export class DevLoggingComponent implements OnInit {

  logFiles: Entry[] = [];
  logText = '';

  constructor(private log: LogProvider,
              private toastService: ToastService,
              private file: File) { }

  ngOnInit() {
    this.initializeLogs();
  }

  initializeLogs(): void {
    this.logText = '';
    this.getTheLogs();
  }

  getTheLogs(): void {
    this.log.getLogFiles()
      .then((files: Entry[]) => {
        this.logFiles = files;
      })
      .catch(err => {
        this.toastService.displayToast('Error when loading the log files.');
      });
  }

  showLogs(index: number): void {
    const name = this.logFiles[index].name;
    const path = this.file.dataDirectory + this.logFiles[index].fullPath.substring(0, this.logFiles[index].fullPath.indexOf('/', 2) + 1);

    this.file.readAsText(path, name).then( content => {
      this.logText = content;
    }).catch((error) => {
      this.toastService.displayToast('Error when loading log file (' + name + '): ', error);
    });
  }

}
