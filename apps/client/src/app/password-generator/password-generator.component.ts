import { Component, EventEmitter, Output } from '@angular/core';
import { generateRandomPassword } from '../password';

@Component({
  selector: 'woizipass-password-generator',
  templateUrl: './password-generator.component.html',
  styleUrls: ['./password-generator.component.css'],
})
export class PasswordGeneratorComponent {
  includeSpecialCharacters = true;
  includeSimilarCharacters = false;

  @Output() generated = new EventEmitter<string>();

  generate(length: number) {
    this.generated.emit(
      generateRandomPassword(
        length,
        this.includeSpecialCharacters,
        this.includeSimilarCharacters
      )
    );
  }
}
