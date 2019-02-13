import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { AuthService } from './auth.service';
import { LoginParams, User } from './auth.model';
import { ResponseObject } from '../shared/common-entities.model';

describe('AuthService', () => {
  // let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let authService: AuthService;
  let expectedResponse: ResponseObject<User>
  let authFailedResponse: ResponseObject<User>

  const params: LoginParams = { username: "test", password: "test1" }
  const expectedUser = {
    id: 1,
    email: "test@test.com",
    name: "Test",
    username: "test",
    token: "fas8778fashhfhjafsd",
    role: { id: 1, name: "", permissions: "" }
  } as User

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService],
      imports: [HttpClientTestingModule]
    });

    // httpClient = TestBed.get(HttpClient)
    httpTestingController = TestBed.get(HttpTestingController)
    authService = TestBed.get(AuthService)
  });

  afterEach(() => {
    httpTestingController.verify()
  })
 
  it('should be created', () => {
    expect(authService).toBeTruthy();
  });

  describe('#authenticate', () => {
    

    beforeEach(() => {
      expectedResponse = {
        success: true,
        data: expectedUser,
        message: "Login Successful",
        total: 1
      }

      authFailedResponse = {
        success: false,
        data: null,
        message: "Invalid Credentials",
        total: 1
      }
    })
   
    it('should return response object with expected user', () => {
      authService.authenticate(params).subscribe(res => {
        expect(res).toEqual(expectedResponse, "Should return a response object with data of type User")
        expect(res.data.token.length).toBeGreaterThan(0, "Token must be set")
      })

      // AuthService should have made one POST request to expected URL 
      const req = httpTestingController.expectOne('api/auth/login')
      expect(req.request.method).toEqual('POST')

      // Respond with mocked expected response
      req.flush(expectedResponse)
    });

    it('should return success: false in response object', () => {
      authService.authenticate(params).subscribe(res => {
        expect(res.success).toEqual(false, "Should return a response object with success: false")
        expect(res.data).toBeNull("Should return response object with data: null")
      })

      // AuthService should have made one POST request to expected URL 
      const req = httpTestingController.expectOne('api/auth/login')
      expect(req.request.method).toEqual('POST')

      // Respond with mocked expected response
      req.flush(authFailedResponse)
    })
  })

  describe('#setUser', () => {
    beforeEach(() => {})

    it('should set currentUser to the user passed to it', () => {
      authService.setUser(expectedUser)

      expect(authService.currentUser).toEqual(expectedUser, "Should store user in currentUser variable")
    })

    it('should store the user passed to it in local storage with the key currentUser', () => {
      authService.setUser(expectedUser)

      expect(JSON.parse(localStorage.getItem("currentUser"))).toEqual(expectedUser, "Should store user in localstorage with key 'currentUser'")
    })
  })

  describe('#getUser', () => {

    it('should return a user', () => {
      const user = authService.getUser()

      expect(user).toEqual(expectedUser, "Should return a user")
    })
  })

  describe('#removeUser', () => {

    it('should remove user from currentUser variable', () => {
      authService.removeUser()

      expect(authService.currentUser).toBeNull("Should remove user from currentUser variable")
    })

    it('should remove currentUser from local storage', () => {
      authService.removeUser()

      expect(JSON.parse(localStorage.getItem("currentUser"))).toBeNull("Should remove user from localstorage")
    })
  })

  describe('#isLoggedIn', () => {
    beforeEach(() => {})

    it('should return true when #setUser is called', () => {
      authService.setUser(expectedUser)

      expect(authService.isLoggedIn()).toBeTruthy("Should return true after #setUser is called")
    })

    it('should return false when #removeUser is called', () => {
      authService.removeUser()

      expect(authService.isLoggedIn()).toBeFalsy("Should return false after #removeUser is called")
    })
  })

  describe('#announceLogin', () => {
    beforeEach(() => {})

    it('should return true', () => {
      authService.announceLogin(true)

      authService.loggedIn$.subscribe(value => {
        expect(value).toBeTruthy("Should return true")
      })
    })

    it('should return false', () => {
      authService.announceLogin(false)

      authService.loggedIn$.subscribe(value => {
        expect(value).toBeFalsy("Should return false")
      })
    })
  })
});
