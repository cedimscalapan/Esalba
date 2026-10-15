import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonApp, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonInput, IonTextarea, IonSelect, IonSelectOption, IonItem, IonBadge, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonNote } from '@ionic/angular/standalone';
import { Geolocation } from '@capacitor/geolocation';

type Report = {id:string; type:string; urgency:string; details:string; people:number; lat:number|null; lng:number|null; accuracy:number|null; created:string};
const KEY='esalba-reports-v1';
@Component({selector:'app-root',standalone:true,imports:[CommonModule,FormsModule,IonApp,IonContent,IonHeader,IonToolbar,IonTitle,IonButton,IonInput,IonTextarea,IonSelect,IonSelectOption,IonItem,IonBadge,IonCard,IonCardHeader,IonCardTitle,IonCardContent,IonNote],template:`
<ion-app><ion-header><ion-toolbar color="primary"><ion-title>eSalba • Emergency Reports</ion-title></ion-toolbar></ion-header><ion-content class="ion-padding">
<div class="intro"><h1>Report an emergency</h1><p>Reports remain on this device until sent. SMS needs a functioning cellular network.</p></div>
<ion-card><ion-card-header><ion-card-title>New incident</ion-card-title></ion-card-header><ion-card-content>
<ion-item><ion-select label="Incident type" labelPlacement="stacked" [(ngModel)]="type"><ion-select-option value="FLOOD">Flood</ion-select-option><ion-select-option value="LANDSLIDE">Landslide</ion-select-option><ion-select-option value="FIRE">Fire</ion-select-option><ion-select-option value="MEDICAL">Medical</ion-select-option><ion-select-option value="OTHER">Other</ion-select-option></ion-select></ion-item>
<ion-item><ion-select label="Urgency" labelPlacement="stacked" [(ngModel)]="urgency"><ion-select-option value="CRITICAL">Critical</ion-select-option><ion-select-option value="HIGH">High</ion-select-option><ion-select-option value="MEDIUM">Medium</ion-select-option><ion-select-option value="LOW">Low</ion-select-option></ion-select></ion-item>
<ion-item><ion-input type="number" min="0" label="People needing help" labelPlacement="stacked" [(ngModel)]="people"></ion-input></ion-item>
<ion-item><ion-textarea label="What happened?" labelPlacement="stacked" maxlength="240" [autoGrow]="true" [(ngModel)]="details"></ion-textarea></ion-item>
<ion-button expand="block" fill="outline" (click)="getLocation()">Get GPS coordinates</ion-button><p class="hint">{{locationText()}}</p>
<ion-button expand="block" (click)="save()">Save report offline</ion-button><p class="hint" role="status">{{message()}}</p>
</ion-card-content></ion-card>
<h2>Saved reports ({{reports().length}})</h2>
<ion-card *ngFor="let r of reports()"><ion-card-content><div class="report-title"><strong>{{r.type}} · {{r.urgency}}</strong><ion-badge color="warning">Not confirmed received</ion-badge></div><p>{{r.details || 'No description'}}</p><ion-note>{{r.created | date:'medium'}} · {{r.lat === null ? 'No GPS' : (r.lat + ', ' + r.lng)}}</ion-note><ion-button expand="block" (click)="openSms(r)">Prepare SMS</ion-button></ion-card-content></ion-card>
<p class="disclaimer">Prototype only. Saving, composing or sending SMS does NOT confirm LGU receipt. Use official emergency channels. A verified LGU SMS number and acknowledgment system are required before real emergency use.</p>
</ion-content></ion-app>`})
export class AppComponent {
 type='FLOOD'; urgency='HIGH'; people=1; details=''; lat:number|null=null; lng:number|null=null; accuracy:number|null=null;
 message=signal(''); locationText=signal('GPS not captured'); reports=signal<Report[]>(this.load());
 private load():Report[]{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return []}}
 async getLocation(){try{const permission=await Geolocation.requestPermissions();if(permission.location!=='granted' && permission.coarseLocation!=='granted'){this.locationText.set('Location permission denied');return}const p=await Geolocation.getCurrentPosition({enableHighAccuracy:true,timeout:20000});this.lat=p.coords.latitude;this.lng=p.coords.longitude;this.accuracy=p.coords.accuracy;this.locationText.set(`GPS: ${this.lat.toFixed(6)}, ${this.lng.toFixed(6)} (±${Math.round(this.accuracy)} m)`)}catch{this.locationText.set('Could not obtain GPS fix. Try in an open area.')}}
 save(){const n=Number(this.people);if(!Number.isInteger(n)||n<0){this.message.set('Enter a valid number of people.');return}const report:Report={id:crypto.randomUUID(),type:this.type,urgency:this.urgency,details:this.details.trim(),people:n,lat:this.lat,lng:this.lng,accuracy:this.accuracy,created:new Date().toISOString()};const next=[report,...this.reports()];try{localStorage.setItem(KEY,JSON.stringify(next));this.reports.set(next);this.message.set('Saved locally — NOT received by LGU.')}catch{this.message.set('Storage failed. Report NOT saved.')}}
 openSms(r:Report){const recipient=''; // Configure only after verifying the LGU gateway number.
 const gps=r.lat===null?'GPS:UNAVAILABLE':`GPS:${r.lat.toFixed(5)},${r.lng!.toFixed(5)}`;
 const msg=`ESALBA|${r.id.slice(0,8)}|${r.type}|${r.urgency}|P:${r.people}|${gps}|${r.details.slice(0,55)}`;
 if(!recipient){this.message.set('No verified LGU SMS gateway configured. Report remains local.');return}
 window.location.href=`sms:${recipient}?body=${encodeURIComponent(msg)}`;
 }
}
