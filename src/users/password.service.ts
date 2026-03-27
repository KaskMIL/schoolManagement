import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordService {
  async hash(password: string) {
    return argon2.hash(password);
  }

  async verify(digest: string, password: string) {
    return argon2.verify(digest, password);
  }
}
