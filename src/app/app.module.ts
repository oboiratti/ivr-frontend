import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BlockUIModule } from 'ng-block-ui';

import { AppComponent } from './app.component';
import { LoadingComponent } from './shared/loading.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PageNotFoundComponent } from './page-not-found.component';
import { LoginComponent } from './auth/login.component';
import { Interceptor } from './shared/interceptor';
import { AuthService } from './auth/auth.service';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { ProfileModule } from './profile/profile.module';
import { AdminModule } from './admin/admin.module';
import { SubscriberModule } from './subscriber/subscriber.module';
import { ContentModule } from './content/content.module';
import { CampaignModule } from './campaign/campaign.module';
import { AppSettingsComponent } from './app-settings/app-settings.component';
import { AppSettingsModule } from './app-settings/app-settings.module';
import { SettingsService } from './app-settings/settings/settings.service';
import { TreeListComponent } from './treeBuilder/tree-list/tree-list.component';
import { TreeStudioComponent } from './treeBuilder/tree-studio/tree-studio.component';

@NgModule({
  declarations: [
    AppComponent,
    LoadingComponent,
    DashboardComponent,
    // SettingsComponent,
    PageNotFoundComponent,
    LoginComponent,
    // GeneralLookupComponent,
    AppSettingsComponent,
    TreeListComponent,
    TreeStudioComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SharedModule,
    AdminModule,
    ProfileModule,
    SubscriberModule,
    ContentModule,
    CampaignModule,
    AppSettingsModule,
    CoreModule,
    BlockUIModule.forRoot()
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: Interceptor, multi: true},
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
