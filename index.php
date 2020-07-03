<?php

  header("Access-Control-Allow-Origin: *");

  $myfile = fopen(".env", "r") or die("Unable to open file!");
  $key = fread($myfile,filesize(".env"));
  fclose($myfile);

  if (isset($_POST['key'])) {

    $dataKey = json_decode($key, true)['key'];
    $rqkey = $_POST['key'];


    if ($rqkey === $dataKey) {

      $action = "data";

      if (isset($_POST['action'])) {
        $action = $_POST['action'];
      }

      $host = $_POST['host'];

      $user = $_POST['username'];

      $password = $_POST['password'];

      $database = $_POST['database'];


      $conn = mysqli_connect($host, $user, $password, $database);

      if ($action === "data") {

        $query = mysqli_query($conn, $_POST['query']);

        $arr = [];

        while($mo = mysqli_fetch_assoc($query)){
          $arr[] = $mo;
        }

        print json_encode($arr);

      }elseif($action === "update" || $action === "save"){
        $query = mysqli_query($conn, $_POST['query']);
        echo "save";
      }

    }else{

      $myfile = fopen(".sorry", "r") or die("Unable to open file!");
      $key = fread($myfile,filesize(".sorry"));
      fclose($myfile);

      print $key;

    }



  }else{


    $myfile = fopen(".sorry", "r") or die("Unable to open file!");
    $key = fread($myfile,filesize(".sorry"));
    fclose($myfile);

    print $key;


  }

  // this only server request not more







  ?>
