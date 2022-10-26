import IsSameAsPreviousPassword from '../../../Validator/Decorators/is.same.as.previous.password.decorator';

export default
class SamePreviousPasswordDto {
  constructor(newPassword: string, userId: number) {
    this.password = newPassword;
    this.userId = userId;
  }

  userId: number;

  @IsSameAsPreviousPassword('userId')
    password!: string;
}
