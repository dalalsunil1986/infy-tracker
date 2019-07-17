@extends('layouts.app')
@section('title')
    Time Entries
@endsection
@section('page_css')
    <link rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/4.17.37/css/bootstrap-datetimepicker.min.css">
    <link rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/4.17.47/css/bootstrap-datetimepicker.css">
@endsection

@section('content')
    <div class="container-fluid">
        <div class="animated fadeIn">
            @include('flash::message')
            <div class="page-header">
                <h3>Time Entries</h3>
                <div class="filter-container">
                    <div class="mr-2">
                        <label for="projects" class="lbl-block"><b>User</b></label>
                        {!!Form::select('drp_user',$users,Auth::id(),['id'=>'filterUser','class'=>'form-control','style'=>'min-width:150px;hight:35', 'placeholder' => 'All'])  !!}
                    </div>
                    <div class="mr-2">
                        <label for="projects" class="lbl-block"><b>Activity Type</b></label>
                        {!!Form::select('drp_activity',$activityTypes,null,['id'=>'filterActivity','class'=>'form-control','style'=>'min-width:150px;hight:35', 'placeholder' => 'All'])  !!}
                    </div>
                    <a href="#" class="btn btn-primary filter-container__btn" id="new_entry" data-toggle="modal"
                       data-target="#timeEntryAddModal"></i>New Time Entry</a>
                </div>
            </div>
            <div class="row">
                <div class="col-lg-12">
                    <div class="card">
                        <div class="card-body">
                            @include('time_entries.table')
                            <div class="pull-right mr-3">

                            </div>
                        </div>
                        @include('time_entries.modal')
                        @include('time_entries.edit_modal')
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
@section('page_js')
    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/4.17.37/js/bootstrap-datetimepicker.min.js"></script>
@endsection

@section('scripts')
    <script>
        let taskUrl = '{{url('tasks')}}/';
        let timeEntryUrl = "{{url('time-entries')}}/";
        let projectsURL = "{{url('projects')}}/";
        let getTaskUrl = "{{url('get-tasks')}}/";
    </script>
    <script src="{{ mix('assets/js/time_entries/time_entry.js') }}"></script>
@endsection