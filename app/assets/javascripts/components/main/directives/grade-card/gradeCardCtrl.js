(function () {
  angular.module('gradepal.main.controllers').controller('GradeCardCtrl', GradeCardCtrl);

  GradeCardCtrl.$inject = ['$scope', '$resource', 'flash'];

  function GradeCardCtrl($scope, $resource, flash) {
    var Grade = $resource('courses/:courseId/components/:componentId/grades/:gradeId', {courseId: '@courseId', componentId: '@componentId', gradeId: '@id', format: 'json' },
      {
        'delete': {method: 'DELETE'},
        'create': {method: 'POST'},
        'save': {method: 'PUT'}
      });

    var ctrl = this;
    ctrl.editing = false;

    ctrl.init = function () {
      ctrl.grade = $scope.gpGrade ? $scope.gpGrade : {};
      // ctrl.grade.id = $scope.gpGradeId;
      ctrl.editing = $scope.gpEditing;
    }

    ctrl.edit = function () {
      ctrl.editing = true;
      ctrl.temp = {name: ctrl.grade.name, score: ctrl.grade.score};
      console.log('Editing grade with id: ' + ctrl.grade.id);
    }

    ctrl.delete = function () {
      console.log('Deleting grade with id: ' + ctrl.grade.id);
      ctrl.grade.$delete({courseId: $scope.gpCourseCtrl.course.id, componentId: $scope.gpComponentCtrl.component.id, gradeId: ctrl.grade.id}, function(){
        $scope.$destroy();}
      );

    }

    ctrl.save = function () {
      ctrl.grade.max = parseInt(ctrl.grade.score.split('/')[1]);
      ctrl.grade.score = parseInt(ctrl.grade.score.split('/')[0]);
      console.log('Saving grade with name: ' + ctrl.grade.name + ', score: ' + ctrl.grade.score + ', weight: ' + ctrl.grade.weight);
      var onError = function (_httpResponse) {
        flash.error = 'Something went wrong';
      }
      if (!ctrl.grade.name) { // bad input
        flash.error = 'Please enter a name for the grade';
        return;
      }
      if (!ctrl.grade.score) { // bad input
        flash.error = 'Please enter a score for the grade';
        return;
      }
      ctrl.editing = false; // successful, so close dialog

      if(ctrl.grade.id) { // This is an existing grade if it already has an id; editing, not creating
        ctrl.grade.$save({courseId: $scope.gpCourseCtrl.course.id, componentId: $scope.gpComponentCtrl.component.id, gradeId: ctrl.grade.id},
          (function() {
            console.log('Updated grade with id ' + ctrl.grade.id);
          }),
          onError
        );
      }
      else { // This is a new grade if it does not have an id
        ctrl.grade.courseId = $scope.gpCourseCtrl.course.id;
        ctrl.grade.componentId = $scope.gpComponentCtrl.component.id;
        Grade.create(ctrl.grade, (
          function (createdGrade) {
            // flash.success = "Grade created successfully"
            ctrl.grade = createdGrade;
            console.log('Created grade with id: ' + ctrl.grade.id);
            $scope.gpComponentCtrl.getGrades();
            $scope.gpComponentCtrl.addingGrade = false;
          }),
            onError
        );
      }
    }

    ctrl.cancel = function () {
      console.log('Cancelling edit');
      if(ctrl.grade.id && ctrl.temp) { // existing grade
        console.log('a');
        ctrl.grade.name = ctrl.temp.name;
        ctrl.grade.score = ctrl.temp.score;
      }
      ctrl.editing = false;
      $scope.gpComponentCtrl.addingGrade = false;
    }

    ctrl.init();
  }

})();