<?php
class Instagram{
  private $user;
  private $pass;
  const ua = 'Instagram 27.0.0.7.97 Android (18/4.3; 320dpi; 720x1280; Xiaomi; HM 1SW; armani; qcom; en_US)';
  const sig_key = '109513c04303341a7daf27bb41b268e633b30dcc65a3fe14503f743176113869';

  public function __construct($user, $pass){
    $this->user = $user;
    $this->pass = $pass;
  }

  public function body($data) {
    $hash = hash_hmac('sha256', $data, self::sig_key);
    $data = urlencode($data);
    return 'ig_sig_key_version=4&signed_body=' . $hash . '.' . $data;
  }

  public function generateDeviceId() {
    return 'android-' . md5(rand(1000, 9999)).rand(2, 9);
  }

  public function generateUUID($type = 0) {
    $uuid = sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff)
    );
    return $type ? $uuid : str_replace('-', '', $uuid);
  }

  public function login(){
    $endpoint = 'https://i.instagram.com/api/v1/accounts/login/';
    $data = '{
              "username": "' . $this->user . '",
              "password": "' . $this->pass . '",
              "guid": "' . $this->generateUUID() . '",
              "device_id": "' . $this->generateDeviceId() . '",
              "Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"
            }';

    $ch = curl_init($endpoint);
    curl_setopt($ch, CURLOPT_USERAGENT, self::ua);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($ch, CURLOPT_HEADER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $this->body($data));

    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch);

    if(!$httpcode) return false; else{
      $header = substr($response, 0, curl_getinfo($ch, CURLINFO_HEADER_SIZE));
      $body = substr($response, curl_getinfo($ch, CURLINFO_HEADER_SIZE));
      curl_close($ch);
      return array($header, $body);
    }

  }
}
echo "+++ Get Cookie Instagram +++\n";
$user = readline("[+] Username  : ");
$pass = readline("[+] Password  : ");
echo "Plase wait ...";

$ig = new Instagram($user, $pass);

$login = $ig->login();
$responHeader = $login[0];
$responBody = json_decode($login[1]);

if($responBody->status === 'ok'){
  $cookie = '';
  preg_match_all('/Set-Cookie: (.*);/U', $responHeader, $setCookies);
  foreach ($setCookies[1] as $item){
    $cookie .= $item . ';';
  }
  echo "\n++++++++++ Result ++++++++++";
  echo "\n\033[0;32m";
  echo $cookie;
  echo "\033[0m";
  echo "\n++++++++++++++++++++++++++++\n";
}else{
  echo "\n\033[1;31m";
  echo $responBody->message;
  echo "\033[0m\n";
}
