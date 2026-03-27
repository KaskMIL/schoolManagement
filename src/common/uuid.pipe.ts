import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import * as uuid from 'uuid';

@Injectable()
export class UuidPipe implements PipeTransform {
  transform(value: string) {
    if (!uuid.validate(value)) throw new NotFoundException();
    return value;
  }
}
