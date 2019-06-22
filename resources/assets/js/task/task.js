$(function () {
    $('#no-record-info-msg').hide();
    $('#filter_project,#filter_status,#filter_user').select2({
        minimumResultsForSearch: -1
    });
    $('#assignTo').select2({
        width: '100%',
        placeholder: "Select Assignee"
    });
    $('#projectId').select2({
        width: '100%',
        placeholder: "Select Project"
    });
    $('#priority,#editPriority').select2({
        width: '100%',
        placeholder: "Select Priority"
    });
    $('#tagIds,#assignee').select2({
        width: '100%',
        tags: true
    });

    $('#dueDate,#editDueDate').datetimepicker({
        format: 'YYYY-MM-DD',
        useCurrent: false,
        icons: {
            up: "icon-angle-up",
            down: "icon-angle-down"
        },
        sideBySide: true,
        minDate: moment().millisecond(0).second(0).minute(0).hour(0)
    });

    $(document).ajaxComplete(function (result) {
        $('input[name=yes]').iCheck({
            checkboxClass: 'icheckbox_line-green',
            insert: '<div class="icheck_line-icon"></div>'
        });
        $('input[name=no]').iCheck({
            checkboxClass: 'icheckbox_line-white',
            insert: '<div class="icheck_line-icon"></div>'
        });
    });
});

var tbl = $('#task_table').DataTable({
    processing: true,
    serverSide: true,
    "order": [[5, "desc"]],
    ajax: {
        url: taskIndexUrl,
        data: function (data) {
            data.filter_project = $('#filter_project').find('option:selected').val();
            data.filter_user = $('#filter_user').find('option:selected').val();
            data.filter_status = $('#filter_status').find('option:selected').val();
        },
    },
    columnDefs: [
        {
            "targets": [7],
            "orderable": false,
            "className": 'text-center',
            "width": "13%"
        },
        {
            "targets": [0],
            "width": "5%",
            "orderable": false,
        },
        {
            "targets": [2],
            "width": "15%",
            "orderable": false,
        },
        {
            "targets": [4, 5],
            "width": "10%",
            "className": 'text-center',
        },
        {
            "targets": [6],
            "width": "15%"
        },
    ],
    columns: [
        {
            data: function (row) {
                return row.status == 1 ? '<div class="active_btn"><input name="yes" id="enabled" class="enabled" type="checkbox" checked data-check="' + row.id + '"></div>' : '<div class="active_btn"><input name="no" id="disabled" type="checkbox" class="enabled" data-check="' + row.id + '"></div>';
            }, name: 'status'
        },
        {
            data: function (row) {
                return '<a href="' + taskUrl + row.id + '" target="_blank">' + row.title + '</a>'
            },
            name: 'title'
        },
        {
            data: function (row) {
                var assignee = [];
                $(row.task_assignee).each(function (i, e) {
                    assignee.push(e.name);
                });

                return assignee.join(", ")
            }, name: 'taskAssignee.name'
        },
        {
            data: 'project.name',
            name: 'project.name'
        },
        {
            data: 'due_date',
            name: 'due_date'
        },
        {
            data: function (row) {
                return row;
            },
            render: function (row) {
                return '<span data-toggle="tooltip" title="' + format(row.created_at, "hh:mm:ss a") + '">' + format(row.created_at) + '</span>';
            },
            name: 'created_at'
        },
        {
            data: function (row) {
                return (row.created_user) ? row.created_user.name : ''
            }, name: 'createdUser.name'
        },
        {
            data: function (row) {
                return '<a title="Edit" class="btn action-btn btn-primary btn-sm mr-1 edit-btn" data-id="' + row.id + '">' +
                    '<i class="cui-pencil action-icon"></i>' + '</a>' +
                    '<a title="Delete" class="btn action-btn btn-danger btn-sm btn-task-delete mr-1" data-task-id="' + row.id + '">' +
                    '<i class="cui-trash action-icon"></i></a>' +
                    '<a title="Add Timer Entry" class="btn btn-success action-btn btn-sm entry-model mr-1" data-toggle="modal" data-target="#timeEntryAddModal" data-id="' + row.id + '" data-project-id="' + row.project.id + '">' +
                    '<i class="fa fa-user-clock action-icon"></i></a>' +
                    '<a title="Details" data-toggle="modal" class="btn action-btn btn-warning btn-sm taskDetails"  data-target="#taskDetailsModal" data-id="' + row.id + '"> ' +
                    '<i class="fa fa-eye action-icon"></i></a>'
            }, name: 'id'
        }
    ],
    "fnInitComplete": function () {
        $('#filter_project,#filter_status,#filter_user').change(function () {
            tbl.ajax.reload();
        });
    },
});

$('#task_table').on('draw.dt', function () {
    $('[data-toggle="tooltip"]').tooltip();
});

// open edit user model
$(document).on('click', '.edit-btn', function (event) {
    let id = $(event.currentTarget).data('id');
    $('#editAssignTo').select2({
        width: '100%',
        placeholder: "Select Assignee"
    });
    $('#editProjectId').select2({
        width: '100%',
        placeholder: "Select Project"
    });
    $('#editTagIds,#editAssignee').select2({
        width: '100%',
        tags: true
    });
    $.ajax({
        url: taskUrl + id + '/edit',
        type: 'GET',
        success: function (result) {
            if (result.success) {
                var task = result.data;
                $('#tagId').val(task.id);
                $('#editTitle').val(task.title);
                $('#editDesc').val(task.description);
                $('#editDueDate').val(task.due_date);
                $('#editProjectId').val(task.project.id).trigger("change");
                if (task.status == 1) {
                    $('#editStatus').prop('checked', true);
                }

                var tagsIds = [];
                var userIds = [];
                $(task.tags).each(function (i, e) {
                    tagsIds.push(e.id);
                });
                $(task.task_assignee).each(function (i, e) {
                    userIds.push(e.id);
                });
                $("#editTagIds").val(tagsIds).trigger('change');

                $("#editAssignee").val(userIds).trigger('change');
                $("#editPriority").val(task.priority).trigger('change');
                $('#EditModal').modal('show');
            }
        },
        error: function (error) {
            manageAjaxErrors(error);
        }
    });
});

// open delete confirmation model
$(document).on('click', '.delete-btn', function (event) {
    let id = $(event.currentTarget).data('id');
    deleteItem(taskUrl + id, '#task_table', 'Task');
});

// open detail confirmation model
$(document).on('click', '.taskDetails', function (event) {
    let id = $(event.currentTarget).data('id');
    startLoader()
    $('#no-record-info-msg').hide();
    $('#taskDetailsTable').hide();
    $.ajax({
        url: taskDetailUrl + '/' + id,
        type: 'GET',
        success: function (result) {
            if (result.success) {
                let data = result.data;
                 stopLoader();
                if (data.totalDuration === 0) {
                    $('#no-record-info-msg').show();
                    return true;
                } else {
                    $('#taskDetailsTable').show();
                }
                var table = $("#taskDetailsTable tbody").html("");
                $.each(data.time_entries, function (idx, elem) {
                    table.append(
                        "<tr>" +
                        "<td id='tdCollapse" + elem.id + "' onclick='manageCollapseIcon(" + JSON.stringify(elem.id) + ")' class='clickable' data-toggle='collapse' data-target='#collapse" + elem.id + "' aria-expanded='false' aria-controls='collapse" + elem.id + "'>" +
                        "<a title='Expand' class='btn btn-success action-btn btn-sm'><span class='fa fa-plus-circle action-icon'></span></a></td>" +
                        "<td>" + elem.user.name + "</td>" +
                        "<td>" + elem.start_time + "</td>" +
                        "<td>" + elem.end_time + "</td>" +
                        "<td>" + elem.duration + "</td>" +
                        "<td><a title='Edit' class='btn action-btn btn-primary btn-sm' onclick='renderTimeEntry(" + elem.id + ")'  style='margin-right:5px;'><i class='cui-pencil action-icon'  style='color:#3c8dbc'></i></a>" +
                        "<a title='Delete' class='btn action-btn btn-danger btn-sm'  onclick='deleteTimeEntry(" + elem.id + ", " + elem.task_id + ")' style='margin-right: 5px'><i class='cui-trash action-icon' style='color:red'></i></a></td>" +
                        "</tr>"
                    );
                    table.append("<tr id='collapse" + elem.id + "' class='collapse'><td colspan='6'><div class='pull-left'>" +
                        "<b>Notes: </b><pre>" + elem.note + "</pre>" +
                        "</div></td></tr>");
                });
                table.append("<tr><td colspan='6'><b>Total Duration : " + data.totalDuration + "</b></td></tr>");
            }
        }
    });
});

$('#addNewForm').submit(function (event) {
    event.preventDefault();
    var loadingButton = jQuery(this).find("#btnSave");
    loadingButton.button('loading');
    $.ajax({
        url: createTaskUrl,
        type: 'POST',
        data: $(this).serialize(),
        success: function (result) {
            if (result.success) {
                $('#AddModal').modal('hide');
                $('#task_table').DataTable().ajax.reload();
            }
        },
        error: function (result) {
            printErrorMessage("#validationErrorsBox", result);
        },
        complete: function () {
            loadingButton.button('reset');
        }
    });
});

$('#editForm').submit(function (event) {
    event.preventDefault();
    var loadingButton = jQuery(this).find("#btnEditSave");
    loadingButton.button('loading');
    var id = $('#tagId').val();
    $.ajax({
        url: taskUrl + id + '/update',
        type: 'post',
        data: $(this).serialize(),
        success: function (result) {
            if (result.success) {
                $('#EditModal').modal('hide');
                $('#task_table').DataTable().ajax.reload();
            }
        },
        error: function (error) {
            manageAjaxErrors(error);
        },
        complete: function () {
            loadingButton.button('reset');
        }
    });
});

$('#AddModal').on('hidden.bs.modal', function () {
    $('#projectId').val(null).trigger("change");
    $('#assignee').val(null).trigger("change");
    $('#tagIds').val(null).trigger("change");
    resetModalForm('#addNewForm', '#validationErrorsBox');
});

$('#EditModal').on('hidden.bs.modal', function () {
    resetModalForm('#editForm', '#editValidationErrorsBox');
});

$(function () {

    $(document).ajaxComplete(function () {
        $("input[class=enabled]").on('ifChanged', function (e) {
            var taskId = ($(this).attr("data-check"));
            manageCheckbox(this);
            updateTaskStatus(taskId);
        });
    });

    function updateTaskStatus(id) {
        $.ajax({
            url: taskUrl + id + '/update-status',
            type: 'POST',
            cache: false,
            success: function (result) {
                if (result.success) {
                    $('#task_table').DataTable().ajax.reload(null, false);
                }
            }
        });
    }
});

window.manageCollapseIcon = function (id) {
    var isExpanded = $('#tdCollapse' + id).attr('aria-expanded');
    if (isExpanded == 'true') {
        $('#tdCollapse' + id).find('a span').removeClass('fa-minus-circle');
        $('#tdCollapse' + id).find('a span').addClass("fa-plus-circle");
    } else {
        $('#tdCollapse' + id).find('a span').removeClass('fa-plus-circle');
        $('#tdCollapse' + id).find('a span').addClass("fa-minus-circle");
    }
}

function setTaskDrp(id) {
    $('#taskId').val(id).trigger("change");
    $("#taskId").prop("disabled", true);
}

$(document).on('click', '.entry-model', function (event) {
    let taskId = $(event.currentTarget).data('id');
    let projectId = $(event.currentTarget).data('project-id');
    $('#timeProjectId').val(projectId).trigger("change");
    getTasksByproject(projectId, '#taskId', taskId, '#tmValidationErrorsBox');
});
