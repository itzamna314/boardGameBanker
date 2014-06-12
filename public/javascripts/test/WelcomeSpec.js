/**
 * Test for Welcome controller action
**/

describe("Welcome",function() {
    var scope,cookies,http,welcomeCtrl;

    // Create a new Welcome controller with default scope, cookies, and http
    beforeEach(function(){
        scope = {},cookies = {},http = {};
        http.get = jasmine.createSpy('httpGetSpy');
        http.post = jasmine.createSpy('httpPostSpy');

        welcomeCtrl = new Welcome(scope,http,cookies);
    });

    describe(".findUser",function() {
        var successCallbackData = {};
        beforeEach(function(){
            function registerGetSuccess(successCallback){
                // Fire callback with test data
                successCallback(successCallbackData);
            }

            http.get.and.returnValue({
                success:registerGetSuccess
            });
        });

        it("should should set user cookie if user found",function() {
            successCallbackData = {
                found:true,
                name:'Rick Sanchez',
                email:'Rick@zygeria.ng'
            }
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
        });

        it("should clear user cookie for not found",function(){
            successCallbackData = {
                found:false,
                name:'',
                email:''
            };

            scope.findUser('Morty');
            expect(JSON.parse(cookies.user)).toEqual({});
            });
        });

    describe(".createUser",function() {
        var successCallbackData = {};

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
});