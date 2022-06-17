|%
+$  sheet  $:(meta=sheet-meta data=(map address row))
+$  sheet-meta  $:
  title=@t
  owner=@p
  tags=(list tag)
  =whitelist
  ==
+$  address  tape
+$  tag  @t
+$  row  (list sell)
+$  sell  $:(meta=sell-meta data=$:(input=@t output=@t))
+$  sell-meta  $:(format=(set visual) =whitelist)
+$  visual  $%
  [%bold  ?]
  [%italic  ?]
  [%underline  ?]
  [%monospace  ?]
  [%foreground  tape]
  [%background  tape]
  [%size  @ud]
  [%font  @t]
  ==
+$  whitelist  (map @p access)
+$  access  ?(%read %write)
--