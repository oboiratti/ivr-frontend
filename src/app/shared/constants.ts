export class RouteNames {
    static login = "login";
    static dashboard = "dashboard";
    static appSettings = "app-settings";
    static settings = "settings";
    static genericSettings = "settings/:model";
    static admin = "admin";
    static users = "users";
    static roles = "roles";

    static subscriber = 'subscriber';
    static subscriberList = 'subscribers';
    static subscriberForm = 'subscribers/form';
    static subscriberFormEdit = 'subscribers/form/:id';

    static subscriberGroupList = 'groups';
    static subscriberGroupForm = 'groups/form';
    static subscriberGroupFormEdit = 'groups/form/:id';

    static subscriberImport = 'import';
    static subscriberExport = 'export';

    static content = 'content';
    static treeList = 'trees';
    static treeListForm = 'trees/form';
    static treeListDets = 'trees/details';
    static treeListDetails = 'trees/details/:id';
    // static treeStudio = 'trees/studio';
    // static treeStudiox = 'trees/studio/:id';
    static treeListFormEdit = 'trees/form/:id';
    static mediaLibrary = 'medialibrary';
    static mediaLibraryForm = 'medialibrary/form';
    static mediaLibraryDets = 'medialibrary/details';
    static mediaLibraryDetails = 'medialibrary/details/:id';
    static mediaLibraryFormEdit = 'medialibrary/form/:id';

    /** Tree Builder Routes */
    static treeStudio = 'trees/studio';
    static treeStudioForm = 'trees/studio/:id';
    static treeStudioEdit = 'trees/studio/edit/:id';

    static campaign = 'campaign';
    static outbound = 'outbound';
    static outboundForm = 'outbound/form';
    static outboundFormEdit = 'outbound/form/:id';
    static schedules = 'schedules'
    static sform = 'form'
    static schedulesWithId = 'outbound/:id/schedules'
    static scheduleForm = 'outbound/:id/schedules/form'
    static scheduleFormEdit = 'outbound/:id/schedules/form/:sid'

    static profile = 'profile';
    static profileForm = 'profile-form';
    static changePassword = 'change-password';
}
