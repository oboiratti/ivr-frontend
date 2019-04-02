import { Component, OnInit, OnDestroy } from '@angular/core';
import { RoleService } from './role.service';
import { Role } from '../../auth/auth.model';
import { MessageDialog } from '../../shared/message_helper';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { finalize, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit, OnDestroy {

  roles$: Observable<Role[]>;
  showForm: boolean;
  privileges: any[] = [];
  role = <Role>{};
  checkAll: boolean;
  title = 'Add New Role';
  @BlockUI() blockForm: NgBlockUI;
  unsubscribe$ = new Subject<void>()

  constructor(private roleService: RoleService) { }

  ngOnInit() {
    this.fetchRoles();
    this.fetchPermissions();
    this.title = 'Add New Role';
  }

  ngOnDestroy() {
    this.unsubscribe$.next()
    this.unsubscribe$.complete()
  }

  openForm() {
    this.showForm = true;
  }

  closeForm() {
    this.title = 'Add New Role';
    this.showForm = false;
    this.role = <Role>{};
  }

  selectRow(role: Role) {
    this.title = 'Edit Role';
    this.role = role;
    this.role.privileges = (role.privileges as string).split(',');
    this.showForm = true;
  }

  save() {
    this.role.privileges = (this.role.privileges as string[]).reduce((acc, elm, index, array) => {
        return (index < array.length - 1) ? acc += `${elm},` : acc += `${elm}`
      }, '')

    if (!this.role.name) {
      MessageDialog.error('Please enter the name of the role to be created');
      return;
    }

    if (this.role.privileges === '') {
      MessageDialog.error('Role must have at least one permission');
      return;
    }

    this.blockForm.start('Saving...')
    this.roleService.save(this.role)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.blockForm.stop();
        if (res.success) {
          this.closeForm();
          this.fetchRoles();
        }
      }, err => {
        this.blockForm.stop();
        console.log('Error -> ' + err.message);
      });
  }

  remove(id: number) {
    MessageDialog.confirm('Delete Role', 'Are you sure you want to delete this role').then((confirm) => {
      if (confirm.value) {
        this.blockForm.start('Deleting')
        this.roleService.destroy(id)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((res) => {
            this.blockForm.stop();
            if (res.success) {
              this.closeForm();
              this.fetchRoles();
              this.role = <Role>{};
            }
          }, err => {
            this.blockForm.stop();
            console.log('Error -> ' + err.message);
          });
      }
    }).catch((err) => {
      this.blockForm.stop();
      console.log('Error -> ' + err.message);
    });
  }

  private fetchRoles() {
    this.blockForm.start('Loading...')
    this.roles$ = this.roleService.fetch().pipe(
      finalize(() => this.blockForm.stop())
    )
  }

  private fetchPermissions() {
    this.roleService.permissions()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        if (res.success) {
          this.privileges = res.data;
        }
      }, err => {
        console.log('Error -> ' + err.message);
      });
  }
}
