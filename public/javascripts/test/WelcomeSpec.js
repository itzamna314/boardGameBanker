/**
 * Test for Welcome controller action
**/

describe("Welcome",function() {
    var scope,cookies,http,welcomeCtrl;

    beforeEach(angular.module('bgbApp'));

    // Create a new Welcome controller with default scope, cookies, and http
    /*beforeEach(angular.inject(function($controller){
        /*http = {}; cookies = {};
        http.get = jasmine.createSpy('httpGetSpy');
        http.post = jasmine.createSpy('httpPostSpy');
        scope = $rootScope.$new();*/

        /*welcomeCtrl = $controller('Welcome',{$scope:scope});
    }));*/

    describe(".findUser",function() {
        beforeEach(setupHttpGetCallback);

        it("should should set user cookie if user found",function() {
            successCallbackData = {
                found:true,
                name:'Rick Sanchez',
                email:'Rick@zygeria.ng'
            };
            scope.findUser('Rick');
            // Should use http to get data from the server
            expect(http.get).toHaveBeenCalled();
            expect(http.get.calls.count()).toEqual(1);
            expect(http.get).toHaveBeenCalledWith('ajax/getuser/Rick');

            // If found, should use cookies to set user data
            expect(JSON.parse(cookies.user)).toEqual({
                email:'Rick@zygeria.ng',
                username:'Rick Sanchez'
            });

            expect(scope.user).toEqual({
                email:'Rick@zygeria.ng',
                name:'Rick Sanchez',
                found:true
            });
        });

        it("should clear user cookie for not found",function(){
            successCallbackData = {
                found:false,
                name:'',
                email:''
            };

            scope.findUser('Morty');
            expect(JSON.parse(cookies.user)).toEqual({});
            expect(scope.user.found).toEqual(false);
        });
    });

    describe(".createUser",function() {
        beforeEach(function(){
            function registerPostSuccess(successCallback){
                successCallback(successCallbackData);
            }

            http.post.and.returnValue({
                success:registerPostSuccess
            });
        });

        it("should set user cookie if the create did not error",function() {
            successCallbackData = {
                error:null,
                message:''
            };

            var username = "Rick";
            var email = "piratesofthepancrease@anatomy-park.com";

            scope.createUser(username,email);
            expect(JSON.parse(cookies.user)).toEqual({
                username:'Rick',
                email:'piratesofthepancrease@anatomy-park.com'
            });
        });

        it("should clear user cookie if the create did error",function(){
            successCallbackData = {
                error:'BadParameters',
                message:'Please specify user and e-mail'
            };

            scope.createUser('A simulation','low settings');
            expect(JSON.parse(cookies.user)).toEqual({});
        });
    });

    describe('.resetUser',function(){
        it("should set user variable on scope to null",function(){
            scope.user = 'I am not null';
            scope.resetUser();
            expect(scope.user).toBe(null);
        });
    });

    describe('.loadUser',function(){
        beforeEach(setupHttpGetCallback);
        it("should load user from cookies, if one is set",function(){
            cookies = {user:'{"email":"foo@bar.com"}'};
            var welcomeWithUser = new Welcome(scope,http,cookies);
            expect(http.get).toHaveBeenCalled();
            expect(http.get.calls.count()).toEqual(1);
            expect(http.get).toHaveBeenCalledWith('ajax/getuser/foo@bar.com');
        });

        it("should do nothing is no user cookie is set",function(){
            expect(http.get.calls.count()).toEqual(0);
            expect(scope.user).toBe(null);
        });
    });

    // Utility functions
    var successCallbackData = {};
    function setupHttpGetCallback(){
        successCallbackData = {};
        function registerGetSuccess(successCallback){
            // Fire callback with test data
            successCallback(successCallbackData);
        }

        http.get.and.returnValue({
            success:registerGetSuccess
        });
    }
});