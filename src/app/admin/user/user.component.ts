import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { User, UserQuery, Role } from '../../auth/auth.model';
import { UserService } from './user.service';
import { RoleService } from '../role/role.service';
import { MessageDialog } from '../../shared/message_helper';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Observable, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

declare var $: any;

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, OnDestroy {

  loading: boolean;
  showForm: boolean;
  saving: boolean;
  deleting: boolean;

  users$: Observable<User[]>
  roles$: Observable<Role[]>;
  userForm: FormGroup;
  user: User;
  selectedUser: User;
  params: UserQuery;
  totalRecords: number;
  selectedFilter: any;
  title = 'Add New User';
  @BlockUI() blockForm: NgBlockUI;
  unsubscribe$ = new Subject<void>()

  constructor(private formBuilder: FormBuilder, private userService: UserService, private roleService: RoleService) {
    this.userForm = this.formBuilder.group({
      id: new FormControl(''),
      name: new FormControl('', Validators.required),
      email: new FormControl('', Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')),
      phoneNumber: new FormControl(''),
      userName: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(5)
      ])),
      password: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(6)
      ])),
      confirmPassword: new FormControl('', Validators.required),
      roleId: new FormControl('', Validators.required)
    }, { validator: this.checkPasswords });
  }

  ngOnInit() {
    this.fetchUsers();
    this.fetchRoles();
    // this.params = <UserQuery>{ page: 0, size: 5, sortField: "id", sortOrder: -1 };
  }

  ngOnDestroy() {
    this.unsubscribe$.next()
    this.unsubscribe$.complete()
  }

  openForm() {
    this.showForm = true;
    // this.userForm.reset();
    this.userForm.get('userName').enable();
  }

  closeForm() {
    this.title = 'Add New User';
    this.showForm = false;
    // this.closeBtn.nativeElement.click();
    this.userForm.reset();
  }

  checkPasswords(formGroup: FormGroup) {
    if (!formGroup.controls) { return null; }
    return formGroup.controls['password'].value === formGroup.controls['confirmPassword'].value ? null : { passwordMismatch: true }
  }

  selectRow(user: User) {
    this.userForm.patchValue(user);
    this.userForm.get('userName').disable();
    this.userForm.get('password').setValidators(null)
    this.userForm.get('confirmPassword').setValidators(null)
    this.userForm.updateValueAndValidity()
    this.showForm = true;
  }

  save() {
    this.user = this.userForm.getRawValue();
    console.log(this.user);
    if (this.user.id) {
      delete this.user.password;
      delete this.user.confirmPassword;
    }

    this.blockForm.start('Saving...');
    this.saving = true;
    this.userService.save(this.user)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((res) => {
      this.saving = false;
      this.blockForm.stop();
      if (res.success) {
        this.closeForm()
        this.fetchUsers();
      }
    }, err => {
      this.blockForm.stop();
      console.log('Error -> ' + err.message);
    });
  }

  remove(id: number) {
    MessageDialog.confirm('Delete User', 'Are you sure you want to delete this user').then((confirm) => {
      if (confirm.value) {
        this.blockForm.start('Deleting...');
        this.deleting = true;
        this.userService.destroy(id)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          this.blockForm.stop();
          this.deleting = false;
          if (res.success) {
            this.closeForm()
            this.fetchUsers();
          }
        }, err => {
          this.blockForm.stop();
          console.log('Error -> ' + err.message);
        });
      }
    }).catch((err) => {
      this.blockForm.stop();
    });
  }

  fetchUsers() {
    this.blockForm.start('Loading...')
    this.users$ = this.userService.fetch().pipe(
      finalize(() => this.blockForm.stop())
    )
  }

  compareRoles(obj1: Role, obj2: Role): boolean {
    return obj1 && obj2 ? obj1.id === obj2.id : obj1 === obj2;
  }

  private fetchRoles() {
    this.roles$ = this.roleService.fetch()
  }
}
