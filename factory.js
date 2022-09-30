
var sopHTML = '<div></div>';
var handCTHTML = '<img src="../common/styles/hand-ct.jpg" />'
var handMRHTML = '<img src="../common/styles/hand-mr.jpg" />'
var handHTML = '<img src="../common/styles/hand.jpg" />'
var folderHTML = '<div><img src="../common/styles/folder-icon.png" /></div>';

var requestScopedSequenceNumber = [];
var requests = [];
var sopSequenceNumber = 0;
var messageSequenceNumber = 0;
var folderSequenceNumber = 0;


function createSOP( modality )
{
    var sop = $( sopHTML )
        .attr( "id", "sop" + sopSequenceNumber++ )
        .addClass( "sop icon" )
        .addClass( modality );

    switch( modality )
    {
        case "ct":
        sop.append( $( handCTHTML ) );
        break;

        case "mr":
        sop.append( $( handMRHTML ) );
        break;

        default:
        sop.append( $( handHTML ) );
        break;        
    }

    return sop;
}

function getValueNode( value )
{
    return '<div class="value">' + value + '</div>';
}

function createSopWithValue( modality, value )
{
    var sop = createSOP( modality );
    $( sop ).append( getValueNode( value ) );
    return sop;
}

function createFolder( sop )
{
    return createFolder( sop, false, 0 );
}

function createFolder( sop, permanent, version )
{
    var folderId = "folder" + folderSequenceNumber++;
    var sopId =  $( sop ).attr( "id" );
    var folder = $( folderHTML )
        .attr( "id", folderId )
        .addClass( "folder icon" );

    if ( ! permanent )
    {
        folder.append( "/usr/loca/PACS/tmp/incoming_files/" + sopId + "/" + sopId );
    }
    else
    {
        folder.append( "/usr/loca/PACS/date/study_uid/series_uid/" + version + "/" + sopId );
    }

    sop.bind( "cleanup",
              function()
              {
                  if ( ! permanent )
                  {
                      $( "#" + folderId )
                          .slideUp(
                              getStepDelay(),
                              function()
                              {
                                  $( "#" + folderId ).remove();
                              }
                          );
                  }
              }
            );
    
    return folder;
}

function newRequest( pacsid, serverid, appid )
{
    var owner = "" + pacsid + "-" + serverid + "-" + appid;

    var scopedSequenceNumber = requestScopedSequenceNumber[ owner ];
    if ( ! scopedSequenceNumber )
    {
	scopedSequenceNumber = 0;
    }
    scopedSequenceNumber += 1;
    requestScopedSequenceNumber[ owner ] = scopedSequenceNumber;

    var requestid = owner + "-" + scopedSequenceNumber;
    
    var request = {
	mRequestId : requestid,
	mPacsId : pacsid,
	mServerId : serverid,
	mAppId : appid,
	mScopedSeq : scopedSequenceNumber
    };

    requests[requestid] = request;
    return request;
}

function createRequest( pacsid, serverid, appid )
{
    var request = newRequest( pacsid, serverid, appid );

    return $( "<div></div>" )
	.addClass( "request")
	.attr( "requestid", request.mRequestId )
	.append( request.mRequestId );
}

function createRequestWithTypeValue( pacsid, serverid, appid, type, value )
{
    var request = createRequest( pacsid, serverid, appid );
    $( request )
        .append( "(" + type + ")" )
        .append( getValueNode( value ) );
    return request;
}
