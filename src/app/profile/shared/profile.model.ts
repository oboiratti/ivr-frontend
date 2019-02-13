export interface Profile {
    id: number
    name: string
    email: string
    phoneNumber: string
    image: string
}

export interface ChangePasswordParams {
    oldPassword: string
    newPassword: string
    passwordConfirmation: string
}