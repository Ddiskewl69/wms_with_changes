$(document).ready(function () {
/* ==========================
       SAVE DRAFT
    ========================== */

    $('.btn-light').on('click', function () {

        Swal.fire({

            icon: 'success',

            title: 'Draft Saved',

            text: 'Your DOA draft has been saved.',

            confirmButtonColor: '#1f5eff'

        });

    });

    /* ==========================
       SUBMIT DOA
    ========================== */

    $('#doaForm').on('submit', function (e) {

        e.preventDefault();

        let project =
            $('#project').val();

        let customer =
            $('#customer').val();

        if (
            project === 'Select Project' ||
            customer === 'Select Customer'
        ) {

            Swal.fire({

                icon: 'warning',

                title: 'Missing Information',

                text:
                    'Please select Project and Customer.',

                confirmButtonColor:
                    '#1f5eff'

            });

            return;

        }

        let doaNumber =
            generateDOANumber();

        Swal.fire({

            icon: 'success',

            title: 'DOA Raised Successfully',

            html: `

                <div style="text-align:center">

                    <h4>${doaNumber}</h4>

                    <p>
                        Your DOA request has been created.
                    </p>

                </div>

            `,

            confirmButtonColor:
                '#1f5eff'

        });

        updateWorkflow();

        this.reset();

    });

    /* ==========================
       FILE NAME PREVIEW
    ========================== */

    $('input[type="file"]').on(
        'change',
        function () {

            const file =
                this.files[0];

            if (!file) return;

            Swal.fire({

                icon: 'info',

                title: 'Document Attached',

                text: file.name,

                timer: 1500,

                showConfirmButton: false

            });

        }

    );

});


/* ==========================
   DOA NUMBER
========================== */

function generateDOANumber() {

    let random =
        Math.floor(
            1000 + Math.random() * 9000
        );

    return `DOA-2026-${random}`;

}


/* ==========================
   WORKFLOW
========================== */

function updateWorkflow() {

    const steps =
        document.querySelectorAll(
            '.workflow-step'
        );

    steps.forEach(step => {

        step.classList.remove(
            'active'
        );

    });

    if (steps.length > 1) {

        steps[1].classList.add(
            'active'
        );

    }

}


/* ==========================
   RESET FORM
========================== */

function clearDOAForm() {

    document
        .getElementById('doaForm')
        .reset();

}


/* ==========================
   FUTURE
========================== */

function loadExistingDOA(id) {

    console.log(
        'Load DOA:',
        id
    );

}

function approveDOA(id) {

    console.log(
        'Approve DOA:',
        id
    );

}

function rejectDOA(id) {

    console.log(
        'Reject DOA:',
        id
    );

}

