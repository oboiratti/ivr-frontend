import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '../../../../node_modules/@angular/common/http/testing';

import { RoleService } from './role.service';
import { Role } from '../../auth/auth.model';

describe('RoleService', () => {
  let roleService: RoleService
  let httpTestingController: HttpTestingController

  const roles: Role[] = [
    {id: 1, name: "role1", permissions: "perm1, perm2"},
    {id: 2, name: "role2", permissions: "perm1, perm2"},
    {id: 3, name: "role3", permissions: "perm1, perm2"}
  ]
  const role = {id: 1, name: "role1", permissions: "perm1, perm2"}

  const expectedRolesResponse = {
    success: true,
    data: roles,
    message: "Roles loaded",
    total: 1
  }

  const expectedNoRolesResponse = {
    success: true,
    data: [],
    message: "Roles loaded",
    total: 1
  }

  const expectedRoleResponse = {
    success: true,
    data: role,
    message: "Some message",
    total: 1
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RoleService],
      imports: [HttpClientTestingModule]
    });

    roleService = TestBed.get(RoleService)
    httpTestingController = TestBed.get(HttpTestingController)
  });

  afterEach(() => {
    httpTestingController.verify()
  })

  it('should be created',  () => {
    expect(roleService).toBeTruthy();
  });

  describe('#fetch', () => {

    it('should return response object', () => {
      roleService.fetch().subscribe(res => {
        expect(res).toEqual(expectedRolesResponse)
      })

      const req = httpTestingController.expectOne('api/roles')
      expect(req.request.method).toBe('GET')

      req.flush(expectedRolesResponse)
    })

    it('should return response object with expected roles', () => {
      roleService.fetch().subscribe(res => {
        expect(res.data.length).toBeGreaterThan(0)
      })

      const req = httpTestingController.expectOne('api/roles')
      expect(req.request.method).toBe('GET')

      req.flush(expectedRolesResponse)
    })

    it('should be ok with empty response object data', () => {
      roleService.fetch().subscribe(res => {
        expect(res).toEqual(expectedNoRolesResponse)
        expect(res.data.length).toEqual(0)
      })

      const req = httpTestingController.expectOne('api/roles')
      expect(req.request.method).toBe('GET')

      req.flush(expectedNoRolesResponse)
    })
  })

  describe('#permissions', () => {})

  describe('#save', () => {})

  describe('#destroy', () => {})
});
