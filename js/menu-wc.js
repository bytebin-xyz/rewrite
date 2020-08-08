'use strict';


customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">Bytebin</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                        <li class="link">
                            <a href="license.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>LICENSE
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AdminModule.html" data-type="entity-link">AdminModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-AdminModule-0d93b8328bbfcbed96957465fbd64b4a"' : 'data-target="#xs-controllers-links-module-AdminModule-0d93b8328bbfcbed96957465fbd64b4a"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AdminModule-0d93b8328bbfcbed96957465fbd64b4a"' :
                                            'id="xs-controllers-links-module-AdminModule-0d93b8328bbfcbed96957465fbd64b4a"' }>
                                            <li class="link">
                                                <a href="controllers/AdminController.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AdminController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-AdminModule-0d93b8328bbfcbed96957465fbd64b4a"' : 'data-target="#xs-injectables-links-module-AdminModule-0d93b8328bbfcbed96957465fbd64b4a"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AdminModule-0d93b8328bbfcbed96957465fbd64b4a"' :
                                        'id="xs-injectables-links-module-AdminModule-0d93b8328bbfcbed96957465fbd64b4a"' }>
                                        <li class="link">
                                            <a href="injectables/AdminService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>AdminService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ApplicationsModule.html" data-type="entity-link">ApplicationsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-ApplicationsModule-d339920251e324f032580ccd8ae04580"' : 'data-target="#xs-controllers-links-module-ApplicationsModule-d339920251e324f032580ccd8ae04580"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ApplicationsModule-d339920251e324f032580ccd8ae04580"' :
                                            'id="xs-controllers-links-module-ApplicationsModule-d339920251e324f032580ccd8ae04580"' }>
                                            <li class="link">
                                                <a href="controllers/ApplicationsController.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ApplicationsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-ApplicationsModule-d339920251e324f032580ccd8ae04580"' : 'data-target="#xs-injectables-links-module-ApplicationsModule-d339920251e324f032580ccd8ae04580"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ApplicationsModule-d339920251e324f032580ccd8ae04580"' :
                                        'id="xs-injectables-links-module-ApplicationsModule-d339920251e324f032580ccd8ae04580"' }>
                                        <li class="link">
                                            <a href="injectables/ApplicationsService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>ApplicationsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link">AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-AppModule-da9ee60d354d6e9efdf4ba4e979272a1"' : 'data-target="#xs-controllers-links-module-AppModule-da9ee60d354d6e9efdf4ba4e979272a1"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppModule-da9ee60d354d6e9efdf4ba4e979272a1"' :
                                            'id="xs-controllers-links-module-AppModule-da9ee60d354d6e9efdf4ba4e979272a1"' }>
                                            <li class="link">
                                                <a href="controllers/AppController.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AppController</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link">AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-AuthModule-5aa1954b1a3df157f702b7f5d53437f5"' : 'data-target="#xs-controllers-links-module-AuthModule-5aa1954b1a3df157f702b7f5d53437f5"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthModule-5aa1954b1a3df157f702b7f5d53437f5"' :
                                            'id="xs-controllers-links-module-AuthModule-5aa1954b1a3df157f702b7f5d53437f5"' }>
                                            <li class="link">
                                                <a href="controllers/AuthController.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AuthController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-AuthModule-5aa1954b1a3df157f702b7f5d53437f5"' : 'data-target="#xs-injectables-links-module-AuthModule-5aa1954b1a3df157f702b7f5d53437f5"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-5aa1954b1a3df157f702b7f5d53437f5"' :
                                        'id="xs-injectables-links-module-AuthModule-5aa1954b1a3df157f702b7f5d53437f5"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>AuthService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/BullBoardModule.html" data-type="entity-link">BullBoardModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-BullBoardModule-a1d451779fec9b6ceceb36b9517b6e04"' : 'data-target="#xs-injectables-links-module-BullBoardModule-a1d451779fec9b6ceceb36b9517b6e04"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-BullBoardModule-a1d451779fec9b6ceceb36b9517b6e04"' :
                                        'id="xs-injectables-links-module-BullBoardModule-a1d451779fec9b6ceceb36b9517b6e04"' }>
                                        <li class="link">
                                            <a href="injectables/BullBoardProvider.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>BullBoardProvider</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/FilesModule.html" data-type="entity-link">FilesModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-FilesModule-fa60d1b65888565b516e0de76006e386"' : 'data-target="#xs-controllers-links-module-FilesModule-fa60d1b65888565b516e0de76006e386"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-FilesModule-fa60d1b65888565b516e0de76006e386"' :
                                            'id="xs-controllers-links-module-FilesModule-fa60d1b65888565b516e0de76006e386"' }>
                                            <li class="link">
                                                <a href="controllers/FilesController.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">FilesController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-FilesModule-fa60d1b65888565b516e0de76006e386"' : 'data-target="#xs-injectables-links-module-FilesModule-fa60d1b65888565b516e0de76006e386"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-FilesModule-fa60d1b65888565b516e0de76006e386"' :
                                        'id="xs-injectables-links-module-FilesModule-fa60d1b65888565b516e0de76006e386"' }>
                                        <li class="link">
                                            <a href="injectables/FilesProcessor.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>FilesProcessor</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/FilesService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>FilesService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/HealthModule.html" data-type="entity-link">HealthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-HealthModule-4525d6daa46e9b86ba904b3e6d3495cb"' : 'data-target="#xs-controllers-links-module-HealthModule-4525d6daa46e9b86ba904b3e6d3495cb"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-HealthModule-4525d6daa46e9b86ba904b3e6d3495cb"' :
                                            'id="xs-controllers-links-module-HealthModule-4525d6daa46e9b86ba904b3e6d3495cb"' }>
                                            <li class="link">
                                                <a href="controllers/HealthController.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">HealthController</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/MailerModule.html" data-type="entity-link">MailerModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-MailerModule-0da9d9024c92ed051a6080b11181adff"' : 'data-target="#xs-injectables-links-module-MailerModule-0da9d9024c92ed051a6080b11181adff"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-MailerModule-0da9d9024c92ed051a6080b11181adff"' :
                                        'id="xs-injectables-links-module-MailerModule-0da9d9024c92ed051a6080b11181adff"' }>
                                        <li class="link">
                                            <a href="injectables/MailerProcessor.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>MailerProcessor</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/MailerService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>MailerService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/SettingsModule.html" data-type="entity-link">SettingsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-SettingsModule-1fd16154b0aa28d10c9324428fee9b23"' : 'data-target="#xs-controllers-links-module-SettingsModule-1fd16154b0aa28d10c9324428fee9b23"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-SettingsModule-1fd16154b0aa28d10c9324428fee9b23"' :
                                            'id="xs-controllers-links-module-SettingsModule-1fd16154b0aa28d10c9324428fee9b23"' }>
                                            <li class="link">
                                                <a href="controllers/SettingsController.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">SettingsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-SettingsModule-1fd16154b0aa28d10c9324428fee9b23"' : 'data-target="#xs-injectables-links-module-SettingsModule-1fd16154b0aa28d10c9324428fee9b23"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-SettingsModule-1fd16154b0aa28d10c9324428fee9b23"' :
                                        'id="xs-injectables-links-module-SettingsModule-1fd16154b0aa28d10c9324428fee9b23"' }>
                                        <li class="link">
                                            <a href="injectables/SettingsService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>SettingsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/StorageModule.html" data-type="entity-link">StorageModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-StorageModule-1a86fd45650d1e2c99b97bc50372b497"' : 'data-target="#xs-injectables-links-module-StorageModule-1a86fd45650d1e2c99b97bc50372b497"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-StorageModule-1a86fd45650d1e2c99b97bc50372b497"' :
                                        'id="xs-injectables-links-module-StorageModule-1a86fd45650d1e2c99b97bc50372b497"' }>
                                        <li class="link">
                                            <a href="injectables/StorageService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>StorageService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UsersModule.html" data-type="entity-link">UsersModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-UsersModule-d826ac5fc668acf92465f70fd98d4f2f"' : 'data-target="#xs-controllers-links-module-UsersModule-d826ac5fc668acf92465f70fd98d4f2f"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UsersModule-d826ac5fc668acf92465f70fd98d4f2f"' :
                                            'id="xs-controllers-links-module-UsersModule-d826ac5fc668acf92465f70fd98d4f2f"' }>
                                            <li class="link">
                                                <a href="controllers/UsersController.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">UsersController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-UsersModule-d826ac5fc668acf92465f70fd98d4f2f"' : 'data-target="#xs-injectables-links-module-UsersModule-d826ac5fc668acf92465f70fd98d4f2f"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UsersModule-d826ac5fc668acf92465f70fd98d4f2f"' :
                                        'id="xs-injectables-links-module-UsersModule-d826ac5fc668acf92465f70fd98d4f2f"' }>
                                        <li class="link">
                                            <a href="injectables/UsersService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>UsersService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/Application.html" data-type="entity-link">Application</a>
                            </li>
                            <li class="link">
                                <a href="classes/ApplicationDto.html" data-type="entity-link">ApplicationDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ApplicationNotFound.html" data-type="entity-link">ApplicationNotFound</a>
                            </li>
                            <li class="link">
                                <a href="classes/ChangeDisplayNameDto.html" data-type="entity-link">ChangeDisplayNameDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ChangeEmailDto.html" data-type="entity-link">ChangeEmailDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ChangePasswordDto.html" data-type="entity-link">ChangePasswordDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ChunkAlreadyUploaded.html" data-type="entity-link">ChunkAlreadyUploaded</a>
                            </li>
                            <li class="link">
                                <a href="classes/Counter.html" data-type="entity-link">Counter</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateApplicationDto.html" data-type="entity-link">CreateApplicationDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/DeleteAccountDto.html" data-type="entity-link">DeleteAccountDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/DiskStorage.html" data-type="entity-link">DiskStorage</a>
                            </li>
                            <li class="link">
                                <a href="classes/DisplayNameAlreadyExists.html" data-type="entity-link">DisplayNameAlreadyExists</a>
                            </li>
                            <li class="link">
                                <a href="classes/EmailAlreadyExists.html" data-type="entity-link">EmailAlreadyExists</a>
                            </li>
                            <li class="link">
                                <a href="classes/EmailChangedEmail.html" data-type="entity-link">EmailChangedEmail</a>
                            </li>
                            <li class="link">
                                <a href="classes/EmailConfirmation.html" data-type="entity-link">EmailConfirmation</a>
                            </li>
                            <li class="link">
                                <a href="classes/EmailConfirmationEmail.html" data-type="entity-link">EmailConfirmationEmail</a>
                            </li>
                            <li class="link">
                                <a href="classes/File.html" data-type="entity-link">File</a>
                            </li>
                            <li class="link">
                                <a href="classes/FileDto.html" data-type="entity-link">FileDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/FileNotFound.html" data-type="entity-link">FileNotFound</a>
                            </li>
                            <li class="link">
                                <a href="classes/FileTooLarge.html" data-type="entity-link">FileTooLarge</a>
                            </li>
                            <li class="link">
                                <a href="classes/ForgotPasswordDto.html" data-type="entity-link">ForgotPasswordDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GenerateApplicationKeyDto.html" data-type="entity-link">GenerateApplicationKeyDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GoogleCloudEngine.html" data-type="entity-link">GoogleCloudEngine</a>
                            </li>
                            <li class="link">
                                <a href="classes/IncorrectPassword.html" data-type="entity-link">IncorrectPassword</a>
                            </li>
                            <li class="link">
                                <a href="classes/InternalServerErrorExceptionFilter.html" data-type="entity-link">InternalServerErrorExceptionFilter</a>
                            </li>
                            <li class="link">
                                <a href="classes/InvalidAPIKey.html" data-type="entity-link">InvalidAPIKey</a>
                            </li>
                            <li class="link">
                                <a href="classes/InvalidCredentials.html" data-type="entity-link">InvalidCredentials</a>
                            </li>
                            <li class="link">
                                <a href="classes/InvalidEmailConfirmationLink.html" data-type="entity-link">InvalidEmailConfirmationLink</a>
                            </li>
                            <li class="link">
                                <a href="classes/InvalidPasswordResetLink.html" data-type="entity-link">InvalidPasswordResetLink</a>
                            </li>
                            <li class="link">
                                <a href="classes/InvalidUserActivationLink.html" data-type="entity-link">InvalidUserActivationLink</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginDto.html" data-type="entity-link">LoginDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/MaxActiveUploadSessionsError.html" data-type="entity-link">MaxActiveUploadSessionsError</a>
                            </li>
                            <li class="link">
                                <a href="classes/NoFilesUploaded.html" data-type="entity-link">NoFilesUploaded</a>
                            </li>
                            <li class="link">
                                <a href="classes/PartialUserDto.html" data-type="entity-link">PartialUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PasswordChangedEmail.html" data-type="entity-link">PasswordChangedEmail</a>
                            </li>
                            <li class="link">
                                <a href="classes/PasswordReset.html" data-type="entity-link">PasswordReset</a>
                            </li>
                            <li class="link">
                                <a href="classes/PasswordResetEmail.html" data-type="entity-link">PasswordResetEmail</a>
                            </li>
                            <li class="link">
                                <a href="classes/RegisterDto.html" data-type="entity-link">RegisterDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/RenameFileDto.html" data-type="entity-link">RenameFileDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ResetPasswordDto.html" data-type="entity-link">ResetPasswordDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StreamMeter.html" data-type="entity-link">StreamMeter</a>
                            </li>
                            <li class="link">
                                <a href="classes/TooManyFields.html" data-type="entity-link">TooManyFields</a>
                            </li>
                            <li class="link">
                                <a href="classes/TooManyFiles.html" data-type="entity-link">TooManyFiles</a>
                            </li>
                            <li class="link">
                                <a href="classes/TooManyParts.html" data-type="entity-link">TooManyParts</a>
                            </li>
                            <li class="link">
                                <a href="classes/UnsupportedContentType.html" data-type="entity-link">UnsupportedContentType</a>
                            </li>
                            <li class="link">
                                <a href="classes/UploadSessionNotFound.html" data-type="entity-link">UploadSessionNotFound</a>
                            </li>
                            <li class="link">
                                <a href="classes/User.html" data-type="entity-link">User</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserActivation.html" data-type="entity-link">UserActivation</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserActivationEmail.html" data-type="entity-link">UserActivationEmail</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserDto.html" data-type="entity-link">UserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UsernameAlreadyExists.html" data-type="entity-link">UsernameAlreadyExists</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserNotActivated.html" data-type="entity-link">UserNotActivated</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserNotFound.html" data-type="entity-link">UserNotFound</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserNotLoggedIn.html" data-type="entity-link">UserNotLoggedIn</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AdminGuard.html" data-type="entity-link">AdminGuard</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AdminMiddleware.html" data-type="entity-link">AdminMiddleware</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthMiddleware.html" data-type="entity-link">AuthMiddleware</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#guards-links"' :
                            'data-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/AuthGuard.html" data-type="entity-link">AuthGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/RecaptchaGuard.html" data-type="entity-link">RecaptchaGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/AsyncStorageOptions.html" data-type="entity-link">AsyncStorageOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeleteFileJob.html" data-type="entity-link">DeleteFileJob</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DiskStorageEngineOptions.html" data-type="entity-link">DiskStorageEngineOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Email.html" data-type="entity-link">Email</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GoogleCloudEngineOptions.html" data-type="entity-link">GoogleCloudEngineOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IncomingFile.html" data-type="entity-link">IncomingFile</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IRequest.html" data-type="entity-link">IRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISession.html" data-type="entity-link">ISession</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MailerModuleAsyncOptions.html" data-type="entity-link">MailerModuleAsyncOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MailerOptions.html" data-type="entity-link">MailerOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MailerOptionsFactory.html" data-type="entity-link">MailerOptionsFactory</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SendEmailChangedJob.html" data-type="entity-link">SendEmailChangedJob</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SendEmailConfirmationJob.html" data-type="entity-link">SendEmailConfirmationJob</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SendEmailJob.html" data-type="entity-link">SendEmailJob</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SendPasswordChangedJob.html" data-type="entity-link">SendPasswordChangedJob</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SendPasswordResetJob.html" data-type="entity-link">SendPasswordResetJob</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SendUserActivationJob.html" data-type="entity-link">SendUserActivationJob</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SessionDto.html" data-type="entity-link">SessionDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StorageEngine.html" data-type="entity-link">StorageEngine</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StorageOptions.html" data-type="entity-link">StorageOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StorageOptionsFactory.html" data-type="entity-link">StorageOptionsFactory</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UploadedFile.html" data-type="entity-link">UploadedFile</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WriteOptions.html" data-type="entity-link">WriteOptions</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise-inverted.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});