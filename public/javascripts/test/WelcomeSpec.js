/**
 * Test for Welcome controller action
**/

describe("Welcome",function() {
    var scope,cookies,$httpBackend,welcomeCtrl,rootScope;

    beforeEach(angular.mock.module('bgbApp'));

    // Create a new Welcome controller with default scope, cookies, and http
    beforeEach(angular.mock.inject(function(_$httpBackend_,$rootScope,$controller){
        $httpBackend = _$httpBackend_;
        rootScope = $rootScope;
        scope = $rootScope.$new();
        cookies = {};

        welcomeCtrl = $controller('Welcome',{$scope:scope,$cookies:cookies});
    }));

    describe(".findUser",function() {
        it("should set user cookie if user found",function() {
            $httpBackend.expectGET('ajax/getuser/Rick@zygeria.ng').respond({
                found:true,
                email:'Rick@zygeria.ng',
                username:'Rick Sanchez'
            });

            scope.findUser('Rick@zygeria.ng');
            $httpBackend.flush();
            // Should use http to get data from the server

            // If found, should use cookies to set user data
            expect(JSON.parse(cookies.user)).toEqual({
                email:'Rick@zygeria.ng',
                username:'Rick Sanchez'
            });

            expect(rootScope.user).toEqual({
                email:'Rick@zygeria.ng',
                username:'Rick Sanchez',
                found:true
            });

            expect(scope.user).toEqual({
                email:'Rick@zygeria.ng',
                username:'Rick Sanchez',
                found:true
            });
        });

        it("should clear user cookie for not found",function(){
            $httpBackend.expectGET('ajax/getuser/Morty@earth.ng').respond({
                found:false,
                email:null,
                username:null
            });

            scope.findUser('Morty@earth.ng');
            $httpBackend.flush();
            expect(JSON.parse(cookies.user)).toEqual({});
            expect(scope.user.found).toEqual(false);
            expect(scope.email).toEqual('Morty@earth.ng');
        });
    });

    describe(".createUser",function() {

        it("should set user cookie if the create did not error",function() {
            $httpBackend
                .expectPOST('ajax/createuser',{
                    username:"Rick",
                    email:"piratesofthepancrease@anatomy-park.com"
                })
                .respond({
                    email:"piratesofthepancrease@anatomy-park.com",
                    username:"Rick",
                    id:5
                });

            var username = "Rick";
            var email = "piratesofthepancrease@anatomy-park.com";

            scope.createUser(username,email);
            $httpBackend.flush();

            var userData = {
                username:'Rick',
                email:'piratesofthepancrease@anatomy-park.com',
                id:5,
                found:true
            };

            expect(JSON.parse(cookies.user)).toEqual(userData);
            expect(scope.user).toEqual(userData);
            expect(rootScope.user).toEqual(userData);
        });

        it("should clear user cookie if the create did error",function(){
            $httpBackend
                .expectPOST('ajax/createuser',{
                    username:"A simulation",
                    email:"lowest settings"
                })
                .respond({
                    error:true,
                    message:'Bad e-mail'
                });

            scope.createUser('A simulation','lowest settings');
            $httpBackend.flush();
            expect(JSON.parse(cookies.user)).toEqual({});
        });
    });

    describe('.resetUser',function(){
        it("should set user variable on scope to null",function(){
            scope.user = 'I am not null';
            scope.resetUser();
            expect(scope.user).toBe(null);
            expect(rootScope.user).toBe(null);
            expect(cookies.user).toBe('{}');
        });
    });

    describe('.loadUser',function(){
        it("should load user from cookies, if one is set",function(){
            cookies.user =  '{"email":"foo@bar.com", "id":12}';

            scope.loadUser();

            expect(scope.user).toBeDefined();
            expect(rootScope.user).toBeDefined();
            expect(cookies.user).toBeDefined();
        });

        it("should do nothing is no user cookie is set",function(){
            cookies.user = '{}';
            scope.loadUser();

            $httpBackend.verifyNoOutstandingRequest();
        });
    });
});