const clientDropDown = $('#client');
clientDropDown.select2({
    width: '100%',
    placeholder: "Select Client",
}).prepend($('<option>', { value: 0, text: 'None' }));

$('#projectIds').select2({
    width: '100%',
    placeholder: "Select Projects"
});

$('#userIds').select2({
    width: '100%',
    placeholder: "Select Users"
});

$('#tagIds').select2({
    width: '100%',
    placeholder: "Select Tags"
});

$('#start_date').datetimepicker({
    format: 'YYYY-MM-DD',
    useCurrent: true,
    icons: {
        up: "icon-angle-up",
        down: "icon-angle-down",
        next: "icon-angle-right",
        previous: "icon-angle-left"
    },
    sideBySide: true,
    maxDate: moment()
});

$('#end_date').datetimepicker({
    format: 'YYYY-MM-DD',
    useCurrent: false,
    icons: {
        up: "icon-angle-up",
        down: "icon-angle-down",
        next: "icon-angle-right",
        previous: "icon-angle-left"
    },
    sideBySide: true,
    maxDate: moment()
});

$("#start_date").on("dp.change", function (e) {
    $('#end_date').data("DateTimePicker").minDate(e.date);
});

clientDropDown.on('change', function () {
    $("#projectIds").empty();
    if ($(this).val() != 0) {
        $("#projectIds").val(null).trigger("change");
    }
    loadProjects($(this).val());
});

function loadProjects(clientId) {
    clientId = (clientId == 0) ? '' : clientId;
    let url = projectsOfClient + '?client_id=' + clientId;
    $.ajax({
        url: url,
        type: 'GET',
        success: function (result) {
            const projects = result.data;
            for (const key in projects) {
                if (projects.hasOwnProperty(key)) {
                    $('#projectIds').append($('<option>', { value: key, text: projects[key] }));
                }
            }
        }
    });
}

$("#projectIds").on('change', function () {
    $("#userIds").empty();
    $("#userIds").val(null).trigger("change");
    loadUsers($(this).val().toString());
});

function loadUsers(projectIds) {
    let url = usersOfProjects + '?projectIds=' + projectIds;
    $.ajax({
        url: url,
        type: 'GET',
        success: function (result) {
            const users = result.data;
            for (const key in users) {
                if (users.hasOwnProperty(key)) {
                    $('#userIds').append($('<option>', { value: key, text: users[key] }));
                }
            }
        }
    });
}

// open delete confirmation model
$(document).on('click', '.delete-btn', function (event) {
    let reportId = $(event.currentTarget).data('id');
    deleteReport(reportUrl + reportId);
});
window.deleteReport = function (url) {
    swal({
        title: "Delete !",
        text: "Are you sure you want to delete this report?",
        type: "warning",
        showCancelButton: true,
        closeOnConfirm: false,
        showLoaderOnConfirm: true,
        confirmButtonColor: '#5cb85c',
        cancelButtonColor: '#d33',
        cancelButtonText: 'No',
        confirmButtonText: 'Yes'
    }, function () {
        $.ajax({
            url: url,
            type: 'DELETE',
            dataType: 'json',
            success: function success(obj) {
                if (obj.success) {
                    location.href = reportUrl;
                }

                swal({
                    title: 'Deleted!',
                    text: 'Report has been deleted.',
                    type: 'success',
                    timer: 2000
                });
            },
            error: function error(data) {
                swal({
                    title: '',
                    text: data.responseJSON.message,
                    type: 'error',
                    timer: 5000
                });
            }
        });
    });
};

let tbl = $('#report_table').DataTable({
    processing: true,
    serverSide: true,
    "order": [[0, "asc"]],
    ajax: {
        url: reporstUrl,
    },
    columnDefs: [
        {
            "targets": [1],
            "width": '12%'
        },
        {
            "targets": [2],
            "orderable": false,
            "className": 'text-center',
            "width": '8%'
        }
    ],
    columns: [
        {
            data: 'name',
            name: 'name'
        },
        {
            data: 'user.name',
            name: 'user.name'
        },
        {
            data: function (row) {
                return '<a title="Run Report" class="btn action-btn btn-success btn-sm mr-1" href="' + reportUrl + row.id + '">' +
                    '<i class="icon-refresh icons action-icon"></i>' + '</a>' +
                    '<a title="Edit" class="btn action-btn btn-primary btn-sm edit-btn mr-1" href="' + reportUrl + row.id + '/edit">' +
                    '<i class="cui-pencil action-icon"></i>' + '</a>' +
                    '<a title="Delete" class="btn action-btn btn-danger btn-sm delete-btn" data-id="' + row.id + '">' +
                    '<i class="cui-trash action-icon" ></i></a>'
            }, name: 'id'
        }
    ],
    "fnInitComplete": function () {
        $('#filterClient').change(function () {
            tbl.ajax.reload();
        });
    }
});
