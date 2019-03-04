import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { SubscriberService } from 'src/app/subscriber/shared/subscriber.service';
import { Observable } from 'rxjs';
import { SubscriberGroup, Subscriber } from 'src/app/subscriber/shared/subscriber.model';

@Component({
  selector: 'app-outbound-form',
  templateUrl: './outbound-form.component.html',
  styleUrls: ['./outbound-form.component.scss']
})
export class OutboundFormComponent implements OnInit {

  subscriberTypes = [
    {label: "All Subscribers", value: 0}, 
    {label: "Selected Groups", value: 1}, 
    {label: "Selected Subscribers", value: 2}]
  scheduleTypes = [
    {label: "Now", value: 0}, 
    {label: "Fixed Date", value: 1}, 
    {label: "Routine", value: 2},
    {label: "Repeating", value: 3}]
  periods = [
      {label: "Days", value: 0}, 
      {label: "Weeks", value: 1}, 
      {label: "Months", value: 2},
      {label: "Years", value: 3}]
  form: FormGroup
  groups$: Observable<SubscriberGroup[]>
  subscribers$: Observable<Subscriber[]>
  toggleIcon = "fa fa-chevron-right"
  toggle = false

  constructor(private fb: FormBuilder,
    private subscriberService: SubscriberService) { }

  ngOnInit() {
    this.setupForm()
    this.loadGroups()
    this.loadSubscribers()
    console.log(new Date().toISOString().substring(11, 16));
    
  }

  doToggle() {
    this.toggle = !this.toggle
    this.toggleIcon = this.toggle ? "fa fa-chevron-down" : "fa fa-chevron-right"
  }

  get subscriberType() {return this.form.get('subscriberType')}
  get scheduleType() {return this.form.get('scheduleType')}
  get subscriberGroups() {return this.form.get('subscriberGroups')}
  get subscribers() {return this.form.get('subscribers')}
  get ends() {return this.form.get('ends')}

  private setupForm() {
    this.form = this.fb.group({
      subscriberType: new FormControl(null, Validators.required),
      scheduleType: new FormControl(null, Validators.required),
      subscriberGroups: new FormControl(null, Validators.required),
      subscribers: new FormControl(null, Validators.required),
      ends: new FormControl(null),
      time: new FormControl(new Date().toISOString().substring(11, 16)),
    })
  }

  private loadGroups() {
    this.groups$ = this.subscriberService.fetchSubscriberGroups()
  }

  private loadSubscribers() {
    this.subscribers$ = this.subscriberService.fetchSubscribers()
  }
}
