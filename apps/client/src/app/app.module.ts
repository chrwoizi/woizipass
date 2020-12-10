import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatCommonModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { UpdateCredentialDialogComponent } from './update-credential-dialog/update-credential-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ChangeMasterPasswordDialogComponent } from './change-master-password-dialog/change-master-password-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PasswordGeneratorComponent } from './password-generator/password-generator.component';
import { DeleteCredentialDialogComponent } from './delete-credential-dialog/delete-credential-dialog.component';
import { AuthModule } from './auth/auth.module';
import { CredentialTableComponent } from './credential-table/credential-table.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { DownloadDialogComponent } from './download-dialog/download-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    UpdateCredentialDialogComponent,
    ChangeMasterPasswordDialogComponent,
    PasswordGeneratorComponent,
    DeleteCredentialDialogComponent,
    CredentialTableComponent,
    DownloadDialogComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatCommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatMenuModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    AuthModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatCardModule,
  ],
  exports: [],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
